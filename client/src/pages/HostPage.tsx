import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { io, Socket } from "socket.io-client";
import type { GamePublicState, TeamId } from "@shared/types";
import { VECTOR_QUESTIONS } from "@shared/questions";
import { VectorMascot } from "../components/VectorMascot";
import { TEAM_AVATARS } from "../data/avatars";
import { api, getSocketUrl } from "../socketUrl";

function avatarEmoji(id: string | null) {
  if (!id) return "—";
  const a = TEAM_AVATARS.find((x) => x.id === id);
  return a ? a.emoji : "—";
}

export function HostPage() {
  const { roomId = "" } = useParams();
  const [state, setState] = useState<GamePublicState | null>(null);
  const [qrBlue, setQrBlue] = useState("");
  const [qrRed, setQrRed] = useState("");
  const socketUrl = getSocketUrl();
  const socketRef = useRef<Socket | null>(null);

  const joinBase = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/join/${roomId}`;
  }, [roomId]);

  useEffect(() => {
    void api<GamePublicState>(`/api/rooms/${roomId}/state`)
      .then(setState)
      .catch(() => setState(null));
  }, [roomId]);

  useEffect(() => {
    if (!joinBase) return;
    void QRCode.toDataURL(`${joinBase}/blue`, { margin: 1, width: 220 }).then(
      setQrBlue,
    );
    void QRCode.toDataURL(`${joinBase}/red`, { margin: 1, width: 220 }).then(
      setQrRed,
    );
  }, [joinBase]);

  useEffect(() => {
    const s: Socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = s;
    s.on("connect", () => {
      s.emit("watch", { roomId });
    });
    s.on("state", (st: GamePublicState) => setState(st));
    return () => {
      socketRef.current = null;
      s.disconnect();
    };
  }, [roomId, socketUrl]);

  const q =
    state != null && state.questionIndex < VECTOR_QUESTIONS.length
      ? VECTOR_QUESTIONS[state.questionIndex]
      : null;

  const bothIn =
    state?.blue.connected && state?.red.connected && state.phase === "lobby";

  function emitStart() {
    socketRef.current?.emit("startGame", { roomId });
  }

  function emitNext() {
    socketRef.current?.emit("nextQuestion", { roomId });
  }

  return (
    <div className="page">
      <div
        className="row"
        style={{
          justifyContent: "space-between",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <Link to="/" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          ← На главную
        </Link>
        <span style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
          Комната: <strong style={{ color: "var(--text)" }}>{roomId}</strong>
        </span>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <VectorMascot
            mood={state?.phase === "finished" ? "win" : "happy"}
            size={88}
          />
          <div>
            <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.35rem" }}>
              Экран для класса
            </h2>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Два QR-кода — синяя и красная команда. Когда обе подключились,
              нажмите «Начать игру».
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            marginTop: "1.25rem",
            textAlign: "center",
          }}
        >
          <div>
            <div className="team-blue" style={{ fontWeight: 800, marginBottom: 8 }}>
              Синие
            </div>
            {qrBlue ? (
              <img src={qrBlue} alt="QR синие" style={{ maxWidth: "100%" }} />
            ) : (
              <span style={{ color: "var(--muted)" }}>QR…</span>
            )}
            <div style={{ fontSize: "0.8rem", marginTop: 6, wordBreak: "break-all" }}>
              {joinBase}/blue
            </div>
          </div>
          <div>
            <div className="team-red" style={{ fontWeight: 800, marginBottom: 8 }}>
              Красные
            </div>
            {qrRed ? (
              <img src={qrRed} alt="QR красные" style={{ maxWidth: "100%" }} />
            ) : (
              <span style={{ color: "var(--muted)" }}>QR…</span>
            )}
            <div style={{ fontSize: "0.8rem", marginTop: 6, wordBreak: "break-all" }}>
              {joinBase}/red
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: "1.25rem" }}>
          <span>
            Синие:{" "}
            <strong className="team-blue">
              {state?.blue.connected ? "онлайн" : "ждём"}
            </strong>{" "}
            {state?.blue.connected && (
              <span title="Аватар" style={{ fontSize: "1.25rem" }}>
                {avatarEmoji(state.blue.avatarId)}
              </span>
            )}
          </span>
          <span>
            Красные:{" "}
            <strong className="team-red">
              {state?.red.connected ? "онлайн" : "ждём"}
            </strong>{" "}
            {state?.red.connected && (
              <span title="Аватар" style={{ fontSize: "1.25rem" }}>
                {avatarEmoji(state.red.avatarId)}
              </span>
            )}
          </span>
        </div>

        {bothIn && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "1rem", width: "100%" }}
            onClick={() => emitStart()}
          >
            Начать игру
          </button>
        )}
      </div>

      {state && state.phase !== "lobby" && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>
              Счёт:{" "}
              <strong className="team-blue">{state.scores.blue}</strong>
              {" : "}
              <strong className="team-red">{state.scores.red}</strong>
            </span>
            <span style={{ color: "var(--muted)" }}>
              Вопрос {state.questionIndex + 1} / {VECTOR_QUESTIONS.length}
            </span>
          </div>

          {state.phase === "playing" && q && (
            <>
              <h3 style={{ margin: "1rem 0 0.75rem", lineHeight: 1.35 }}>
                {q.text}
              </h3>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "1.25rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                {q.options.map((o, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {o}
                  </li>
                ))}
              </ol>
              <p style={{ marginTop: "1rem", fontSize: "0.95rem" }}>
                Синие:{" "}
                {state.blue.currentAnswer === null
                  ? "думают…"
                  : "ответ записан ✓"}
                {" · "}
                Красные:{" "}
                {state.red.currentAnswer === null
                  ? "думают…"
                  : "ответ записан ✓"}
              </p>
            </>
          )}

          {state.phase === "between" && state.lastReveal && q && (
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ margin: "0 0 0.5rem", fontWeight: 700 }}>
                Правильный ответ:{" "}
                <span style={{ color: "var(--ok)" }}>
                  {q.options[state.lastReveal.correctIndex]}
                </span>
              </p>
              <RevealTable
                last={state.lastReveal}
                labels={{ blue: state.blue.groupLabel, red: state.red.groupLabel }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: "1rem", width: "100%" }}
                onClick={() => emitNext()}
              >
                Следующий вопрос
              </button>
            </div>
          )}

          {state.phase === "finished" && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <VectorMascot mood="win" size={100} />
              <h3 style={{ margin: "0.75rem 0" }}>
                {state.winner === "draw" && "Ничья!"}
                {state.winner === "blue" && (
                  <>
                    Победили:{" "}
                    <span className="team-blue">
                      {state.blue.groupLabel || "Синие"}
                    </span>
                  </>
                )}
                {state.winner === "red" && (
                  <>
                    Победили:{" "}
                    <span className="team-red">
                      {state.red.groupLabel || "Красные"}
                    </span>
                  </>
                )}
              </h3>
              <p style={{ fontSize: "1.25rem" }}>
                <span className="team-blue">{state.scores.blue}</span>
                {" : "}
                <span className="team-red">{state.scores.red}</span>
              </p>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Результаты сохранены в таблице рейтингов.
              </p>
              <Link
                to="/ratings"
                className="btn btn-ghost"
                style={{ marginTop: "0.75rem", display: "inline-flex" }}
              >
                Открыть рейтинг
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RevealTable({
  last,
  labels,
}: {
  last: NonNullable<GamePublicState["lastReveal"]>;
  labels: { blue: string; red: string };
}) {
  const rows: { team: TeamId; label: string; time: number | null; ok: boolean; pts: number }[] =
    [
      {
        team: "blue",
        label: labels.blue || "Синие",
        time: last.blueTimeSec,
        ok: last.blueCorrect,
        pts: last.pointsBlue,
      },
      {
        team: "red",
        label: labels.red || "Красные",
        time: last.redTimeSec,
        ok: last.redCorrect,
        pts: last.pointsRed,
      },
    ].sort((a, b) => {
      if (a.time == null) return 1;
      if (b.time == null) return -1;
      return a.time - b.time;
    });

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.95rem",
        marginTop: "0.5rem",
      }}
    >
      <thead>
        <tr style={{ color: "var(--muted)", textAlign: "left" }}>
          <th style={{ padding: "6px 4px" }}>Команда</th>
          <th style={{ padding: "6px 4px" }}>Время (с)</th>
          <th style={{ padding: "6px 4px" }}>Верно</th>
          <th style={{ padding: "6px 4px" }}>Очки</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.team}
            style={{
              borderTop: "1px solid rgba(148,163,184,0.15)",
              color: r.team === "blue" ? "var(--blue)" : "var(--red)",
            }}
          >
            <td style={{ padding: "8px 4px", fontWeight: 700 }}>
              {r.label}
              {last.fasterTeam === r.team && last.blueCorrect && last.redCorrect && (
                <span style={{ marginLeft: 6, fontSize: "0.8rem", color: "var(--warn)" }}>
                  (быстрее)
                </span>
              )}
            </td>
            <td style={{ padding: "8px 4px" }}>
              {r.time != null ? r.time.toFixed(2) : "—"}
            </td>
            <td style={{ padding: "8px 4px" }}>{r.ok ? "да" : "нет"}</td>
            <td style={{ padding: "8px 4px" }}>+{r.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
