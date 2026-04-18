import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { nanoid } from "nanoid";
import { Server } from "socket.io";
import { GameRoom } from "./gameRoom";
import { addRanking, getClasses, getRankings, saveClasses } from "./storage";
import type { ClassEntry, TeamId } from "../shared/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const clientDist = path.join(__dirname, "..", "client", "dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const rooms = new Map<string, GameRoom>();

function getOrCreateRoom(roomId: string): GameRoom {
  let r = rooms.get(roomId);
  if (!r) {
    r = new GameRoom(roomId);
    rooms.set(roomId, r);
  }
  return r;
}

app.post("/api/rooms", (_req, res) => {
  const roomId = nanoid(8);
  getOrCreateRoom(roomId);
  res.json({ roomId });
});

app.get("/api/rooms/:roomId/state", (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  res.json(room.getState());
});

app.get("/api/rankings", (_req, res) => {
  res.json(getRankings());
});

app.get("/api/classes", (_req, res) => {
  res.json(getClasses());
});

app.put("/api/classes", (req, res) => {
  const body = req.body as { classes?: ClassEntry[] };
  if (!body.classes || !Array.isArray(body.classes)) {
    return res.status(400).json({ error: "Нужен массив classes" });
  }
  saveClasses(body.classes);
  res.json({ ok: true });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: true },
});

function broadcast(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("state", room.getState());
}

function persistFinishedGame(room: GameRoom) {
  const st = room.getState();
  if (st.phase !== "finished" || room.rankingSaved) return;
  room.rankingSaved = true;

  const blue = st.blue;
  const red = st.red;

  addRanking({
    roomId: st.roomId,
    className: blue.className || red.className || "—",
    groupLabel: blue.groupLabel || "Синие",
    team: "blue",
    score: st.scores.blue,
    members: blue.members,
  });
  addRanking({
    roomId: st.roomId,
    className: red.className || blue.className || "—",
    groupLabel: red.groupLabel || "Красные",
    team: "red",
    score: st.scores.red,
    members: red.members,
  });
}

io.on("connection", (socket) => {
  let joinedRoom: string | null = null;
  let team: TeamId | null = null;
  let watching = false;

  socket.on("watch", (payload: { roomId: string }) => {
    if (joinedRoom) return;
    watching = true;
    joinedRoom = payload.roomId;
    socket.join(payload.roomId);
    const room = rooms.get(payload.roomId);
    if (room) socket.emit("state", room.getState());
  });

  socket.on(
    "join",
    (payload: { roomId: string; team: TeamId }, cb?: (err?: string) => void) => {
      try {
        if (watching) {
          cb?.("Уже в режиме наблюдателя");
          return;
        }
        const room = getOrCreateRoom(payload.roomId);
        joinedRoom = payload.roomId;
        team = payload.team;
        socket.join(payload.roomId);
        room.connectTeam(socket.id, payload.team);
        broadcast(payload.roomId);
        cb?.();
      } catch (e) {
        cb?.(e instanceof Error ? e.message : "Ошибка");
      }
    },
  );

  socket.on(
    "updateTeam",
    (
      payload: {
        className?: string;
        groupLabel?: string;
        members?: string[];
        avatarId?: string | null;
        ready?: boolean;
      },
      cb?: () => void,
    ) => {
      if (!joinedRoom || !team) return;
      const room = rooms.get(joinedRoom);
      if (!room) return;
      room.updateTeam(team, payload);
      broadcast(joinedRoom);
      cb?.();
    },
  );

  socket.on("startGame", (payload: { roomId: string }) => {
    const room = rooms.get(payload.roomId);
    if (!room) return;
    room.startGame();
    broadcast(payload.roomId);
  });

  socket.on("answer", (payload: { choiceIndex: number }, cb?: () => void) => {
    if (!joinedRoom || !team) return;
    const room = rooms.get(joinedRoom);
    if (!room) return;
    room.submitAnswer(team, payload.choiceIndex);
    broadcast(joinedRoom);
    cb?.();
  });

  socket.on("nextQuestion", (payload: { roomId: string }) => {
    const room = rooms.get(payload.roomId);
    if (!room) return;
    const prevPhase = room.getState().phase;
    room.advance();
    const st = room.getState();
    if (prevPhase === "between" && st.phase === "finished") {
      persistFinishedGame(room);
    }
    broadcast(payload.roomId);
  });

  socket.on("disconnect", () => {
    if (!joinedRoom || watching) return;
    const room = rooms.get(joinedRoom);
    if (!room) return;
    room.disconnectSocket(socket.id);
    broadcast(joinedRoom);
  });
});

if (isProd) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, () => {
  console.log(`Сервер: http://127.0.0.1:${PORT}`);
});
