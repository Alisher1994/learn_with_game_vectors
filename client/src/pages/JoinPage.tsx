import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import type { ClassEntry, GamePublicState, TeamId } from "@shared/types";
import { VECTOR_QUESTIONS } from "@shared/questions";
import { TEAM_AVATARS } from "../data/avatars";
import { VectorMascot } from "../components/VectorMascot";
import { api, getSocketUrl } from "../socketUrl";
function isTeam(s: string | undefined): s is TeamId {
  return s === "blue" || s === "red";
}

export function JoinPage() {
  const { roomId = "", team: teamParam } = useParams();
  const team = isTeam(teamParam) ? teamParam : "blue";
  const socketUrl = getSocketUrl();
  const socketRef = useRef<Socket | null>(null);

  const [state, setState] = useState<GamePublicState | null>(null);
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [className, setClassName] = useState("");
  const [groupLabel, setGroupLabel] = useState(
    team === "blue" ? "Синий вектор" : "Красный вектор",
  );
  const [members, setMembers] = useState<string[]>([""]);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [pickedClassId, setPickedClassId] = useState<string>("");

  useEffect(() => {
    void api<ClassEntry[]>("/api/classes").then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    void api<GamePublicState>(`/api/rooms/${roomId}/state`)
      .then(setState)
      .catch(() => setState(null));
  }, [roomId]);

  const pushUpdate = useCallback(() => {
    socketRef.current?.emit("updateTeam", {
      className,
      groupLabel,
      members: members.map((m) => m.trim()).filter(Boolean),
      avatarId,
      ready,
    });
  }, [className, groupLabel, members, avatarId, ready]);

  useEffect(() => {
    const s: Socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = s;
    s.on("connect", () => {
      s.emit("join", { roomId, team });
    });
    s.on("state", (st: GamePublicState) => setState(st));
    return () => {
      socketRef.current = null;
      s.disconnect();
    };
  }, [roomId, team, socketUrl]);

  useEffect(() => {
    const t = window.setTimeout(() => pushUpdate(), 350);
    return () => window.clearTimeout(t);
  }, [pushUpdate]);

  const q = useMemo(() => {
    if (!state || state.phase !== "playing") return null;
    return VECTOR_QUESTIONS[state.questionIndex] ?? null;
  }, [state]);

  const teamColor = team === "blue" ? "var(--blue)" : "var(--red)";
  const teamLabel = team === "blue" ? "Синие" : "Красные";

  function addMember() {
    setMembers((m) => [...m, ""]);
  }

  function setMember(i: number, v: string) {
    setMembers((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  function applyClassFromList(id: string) {
    setPickedClassId(id);
    const c = classes.find((x) => x.id === id);
    if (c) {
      setClassName(c.name);
      if (c.students.length) setMembers([...c.students, ""]);
    }
  }

  function submitAnswer(i: number) {
    socketRef.current?.emit("answer", { choiceIndex: i });
  }

  if (!isTeam(teamParam)) {
    return (
      <div className="page">
        <div className="card">Неверная ссылка команды.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: "1rem" }}>
        <VectorMascot mood="happy" size={56} />
        <div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", color: teamColor }}>
            {teamLabel}
          </h1>
          <p style={{ margin: "0.15rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            Комната {roomId}
          </p>
        </div>
      </div>

      {state?.phase === "lobby" && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Команда</h2>

          <label className="label">Аватар</label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {TEAM_AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                className="btn btn-ghost"
                onClick={() => setAvatarId(a.id)}
                style={{
                  opacity: avatarId === a.id ? 1 : 0.65,
                  outline:
                    avatarId === a.id ? `2px solid ${teamColor}` : undefined,
                  borderRadius: 12,
                }}
                title={a.label}
              >
                <span style={{ fontSize: "1.5rem" }}>{a.emoji}</span>
              </button>
            ))}
          </div>

          {classes.length > 0 && (
            <>
              <label className="label">Класс из справочника (учитель)</label>
              <select
                className="input"
                value={pickedClassId}
                onChange={(e) => applyClassFromList(e.target.value)}
                style={{ marginBottom: "0.75rem" }}
              >
                <option value="">— выбрать —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.students.length} уч.)
                  </option>
                ))}
              </select>
            </>
          )}

          <label className="label">Класс (например 8А)</label>
          <input
            className="input"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="8А"
            style={{ marginBottom: "0.75rem" }}
          />

          <label className="label">Название группы</label>
          <input
            className="input"
            value={groupLabel}
            onChange={(e) => setGroupLabel(e.target.value)}
            style={{ marginBottom: "0.75rem" }}
          />

          <label className="label">Участники (ФИО)</label>
          {members.map((m, i) => (
            <input
              key={i}
              className="input"
              value={m}
              onChange={(e) => setMember(i, e.target.value)}
              placeholder={`Ученик ${i + 1}`}
              style={{ marginBottom: "0.45rem" }}
            />
          ))}
          <button type="button" className="btn btn-ghost" onClick={addMember}>
            + Добавить участника
          </button>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={ready}
              onChange={(e) => setReady(e.target.checked)}
            />
            <span>Мы готовы (можно начинать, когда подключится вторая команда)</span>
          </label>
        </div>
      )}

      {state && state.phase === "playing" && q && (
        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem", lineHeight: 1.35 }}>
            {q.text}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {q.options.map((opt, i) => {
              const mine =
                team === "blue"
                  ? state.blue.currentAnswer
                  : state.red.currentAnswer;
              const disabled = mine !== null;
              const isMine = mine === i;
              return (
                <button
                  key={i}
                  type="button"
                  className="btn"
                  disabled={disabled}
                  onClick={() => submitAnswer(i)}
                  style={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    background: isMine
                      ? "rgba(59,130,246,0.25)"
                      : "rgba(148,163,184,0.12)",
                    color: "var(--text)",
                    border:
                      isMine ? `2px solid ${teamColor}` : "1px solid transparent",
                  }}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              );
            })}
          </div>
          {(team === "blue" ? state.blue : state.red).currentAnswer !== null && (
            <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
              Ответ отправлен. Ждём вторую команду…
            </p>
          )}
        </div>
      )}

      {state && state.phase === "between" && (
        <div className="card">
          <p style={{ margin: 0 }}>Идёт подсчёт на большом экране…</p>
        </div>
      )}

      {state && state.phase === "finished" && (
        <div className="card" style={{ textAlign: "center" }}>
          <p>Игра окончена. Смотрите итог на экране учителя.</p>
          <Link to="/ratings" className="btn btn-ghost" style={{ marginTop: "0.75rem" }}>
            Рейтинг
          </Link>
        </div>
      )}

      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "1rem" }}>
        Подсказка: учитель может заранее заполнить классы в разделе «Справочник».
      </p>
    </div>
  );
}
