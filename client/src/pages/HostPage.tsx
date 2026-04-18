import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { io, Socket } from "socket.io-client";
import type { GamePublicState, TeamId, TeamState } from "@shared/types";
import { VECTOR_QUESTIONS } from "@shared/questions";
import { VectorMascot } from "../components/VectorMascot";
import { ConfettiSalute } from "../components/ConfettiSalute";
import { TEAM_AVATARS } from "../data/avatars";
import { api, getSocketUrl, SOCKET_OPTIONS } from "../socketUrl";

const MAX_POINTS_CAP = VECTOR_QUESTIONS.length * 15;

function fightBarPercent(score: number): number {
  return Math.min(100, (score / MAX_POINTS_CAP) * 100);
}

function FightHud({
  scores,
  questionIndex,
  phase,
}: {
  scores: { blue: number; red: number };
  questionIndex: number;
  phase: GamePublicState["phase"];
}) {
  const bp = fightBarPercent(scores.blue);
  const rp = fightBarPercent(scores.red);
  const roundLabel =
    phase === "finished"
      ? "Игра окончена"
      : `Раунд ${questionIndex + 1} / ${VECTOR_QUESTIONS.length}`;

  return (
    <div className="fight-hud">
      <div className="fight-hud__meta">{roundLabel}</div>
      <div className="fight-hud__scores">
        <span className="fight-hud__num fight-hud__num--blue">{scores.blue}</span>
        <span className="fight-hud__vs">VS</span>
        <span className="fight-hud__num fight-hud__num--red">{scores.red}</span>
      </div>
      <div className="fight-hud__bars">
        <div className="fight-hud__track fight-hud__track--blue">
          <div className="fight-hud__fill fight-hud__fill--blue" style={{ width: `${bp}%` }} />
        </div>
        <div className="fight-hud__track fight-hud__track--red">
          <div className="fight-hud__fill fight-hud__fill--red" style={{ width: `${rp}%` }} />
        </div>
      </div>
    </div>
  );
}

function AnswerArenaStrip({ state }: { state: GamePublicState }) {
  const b = state.blue.currentAnswer;
  const r = state.red.currentAnswer;
  if (b !== null && r !== null) return null;

  const blueDone = b !== null;
  const redDone = r !== null;
  const gridCols =
    blueDone && !redDone ? "1.35fr 0.65fr" : redDone && !blueDone ? "0.65fr 1.35fr" : "1fr 1fr";

  return (
    <div className="answer-arena" style={{ gridTemplateColumns: gridCols }}>
      <div
        className={[
          "answer-arena__side answer-arena__side--blue",
          blueDone ? "answer-arena__side--active-blue" : "answer-arena__side--wait",
        ].join(" ")}
      >
        <div className="answer-arena__big team-blue">
          {blueDone ? "Синие ответили!" : "Синие…"}
        </div>
        <div className="answer-arena__sub">
          {blueDone ? (redDone ? "" : "Ждём красных") : "ожидание ответа"}
        </div>
      </div>
      <div
        className={[
          "answer-arena__side answer-arena__side--red",
          redDone ? "answer-arena__side--active-red" : "answer-arena__side--wait",
        ].join(" ")}
      >
        <div className="answer-arena__big team-red">
          {redDone ? "Красные ответили!" : "Красные…"}
        </div>
        <div className="answer-arena__sub">
          {redDone ? (blueDone ? "" : "Ждём синих") : "ожидание ответа"}
        </div>
      </div>
    </div>
  );
}

function confettiSideFromReveal(
  last: NonNullable<GamePublicState["lastReveal"]>,
): "blue" | "red" | "both" | "none" {
  if (last.blueCorrect && last.redCorrect) return "both";
  if (last.blueCorrect) return "blue";
  if (last.redCorrect) return "red";
  return "none";
}

function avatarEmoji(id: string | null) {
  if (!id) return "—";
  const a = TEAM_AVATARS.find((x) => x.id === id);
  return a ? a.emoji : "—";
}

function TeamLobbyBlock({
  title,
  colorVar,
  joinSuffix,
  joinBase,
  qrDataUrl,
  team,
}: {
  title: string;
  colorVar: string;
  joinSuffix: "blue" | "red";
  joinBase: string;
  qrDataUrl: string;
  team: TeamState | undefined;
}) {
  const connected = team?.connected ?? false;
  const ready = team?.ready ?? false;
  const showQr = !connected || !ready;
  const url = `${joinBase}/${joinSuffix}`;

  return (
    <div
      style={{
        borderRadius: 12,
        padding: "0.75rem",
        background: "rgba(15, 20, 25, 0.35)",
        border: `1px solid ${colorVar}33`,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10, color: colorVar }}>{title}</div>

      <div
        style={{
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showQr && qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR ${title}`} style={{ maxWidth: "100%", width: 220 }} />
        ) : null}
        {connected && ready ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "6.5rem", lineHeight: 1 }}>
              {team?.avatarId ? avatarEmoji(team.avatarId) : "👥"}
            </div>
            <div style={{ marginTop: 8, fontWeight: 800, color: "var(--ok)" }}>Готовы ✓</div>
            {team?.groupLabel ? (
              <div style={{ marginTop: 6, fontSize: "0.95rem", color: "var(--muted)" }}>
                {team.groupLabel}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div style={{ fontSize: "0.82rem", marginTop: 10, color: "var(--muted)", wordBreak: "break-all" }}>
        {url}
      </div>

      <div style={{ marginTop: 10, fontSize: "0.95rem" }}>
        {!connected && <span style={{ color: "var(--muted)" }}>Ждём подключения по QR</span>}
        {connected && !ready && (
          <span style={{ color: "var(--warn)" }}>Онлайн — заполняют анкету</span>
        )}
        {connected && ready && (
          <span style={{ color: "var(--ok)" }}>Онлайн и готовы к старту</span>
        )}
      </div>
    </div>
  );
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
    const s: Socket = io(socketUrl, { ...SOCKET_OPTIONS });
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
  const bothReady = Boolean(state?.blue.ready && state?.red.ready);

  function emitStart() {
    socketRef.current?.emit("startGame", { roomId });
  }

  function emitNext() {
    socketRef.current?.emit("nextQuestion", { roomId });
  }

  const inGame = state && state.phase !== "lobby";

  return (
    <div className={`page ${inGame ? "page--host-arena" : ""}`}>
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

      {state && state.phase !== "lobby" && (
        <FightHud
          scores={state.scores}
          questionIndex={state.questionIndex}
          phase={state.phase}
        />
      )}

      <div className="card" style={{ marginBottom: "1rem", display: inGame ? "none" : undefined }}>
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
              Два QR-кода — синяя и красная команда. Когда команды нажмут «Мы готовы»,
              на экране появятся их аватары. Когда обе в сети — можно начинать игру.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginTop: "1.25rem",
            textAlign: "center",
          }}
        >
          <TeamLobbyBlock
            title="Синие"
            colorVar="var(--blue)"
            joinSuffix="blue"
            joinBase={joinBase}
            qrDataUrl={qrBlue}
            team={state?.blue}
          />
          <TeamLobbyBlock
            title="Красные"
            colorVar="var(--red)"
            joinSuffix="red"
            joinBase={joinBase}
            qrDataUrl={qrRed}
            team={state?.red}
          />
        </div>

        <div
          className="row"
          style={{
            marginTop: "1rem",
            justifyContent: "center",
            gap: "1.25rem",
            flexWrap: "wrap",
            fontSize: "0.95rem",
          }}
        >
          <span>
            Синие:{" "}
            <strong className="team-blue">
              {!state?.blue.connected ? "ждём в сети" : state.blue.ready ? "готовы ✓" : "онлайн"}
            </strong>
          </span>
          <span>
            Красные:{" "}
            <strong className="team-red">
              {!state?.red.connected ? "ждём в сети" : state.red.ready ? "готовы ✓" : "онлайн"}
            </strong>
          </span>
          {bothIn && !bothReady && (
            <span style={{ color: "var(--muted)", width: "100%", textAlign: "center" }}>
              Дождитесь, пока обе команды отметят «Мы готовы» — или начните, когда будете уверены.
            </span>
          )}
        </div>

        {bothIn && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "1rem", width: "100%" }}
            onClick={() => emitStart()}
          >
            Начать игру
            {bothReady ? "" : " (можно и до «готовы» у всех)"}
          </button>
        )}
      </div>

      {state && state.phase !== "lobby" && (
        <div className="card host-game-card" style={{ marginBottom: "1rem" }}>
          {state.phase === "playing" && q && (
            <>
              <AnswerArenaStrip state={state} />
              <h3 className="host-question">{q.text}</h3>
              <ul className="host-options">
                {q.options.map((o, i) => (
                  <li key={i}>
                    <span className="host-options__letter">{String.fromCharCode(65 + i)}.</span>{" "}
                    {o}
                  </li>
                ))}
              </ul>
            </>
          )}

          {state.phase === "between" && state.lastReveal && q && (
            <div style={{ position: "relative", minHeight: 120 }}>
              <ConfettiSalute side={confettiSideFromReveal(state.lastReveal)} />
              <AnswerArenaStrip state={state} />
              <div className="host-correct-box">
                <div className="host-correct-box__label">Верный вариант</div>
                <div className="host-correct-box__text">
                  {String.fromCharCode(65 + state.lastReveal.correctIndex)}.{" "}
                  {q.options[state.lastReveal.correctIndex]}
                </div>
              </div>
              <RevealTable
                last={state.lastReveal}
                labels={{ blue: state.blue.groupLabel, red: state.red.groupLabel }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: "1rem", width: "100%", fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                onClick={() => emitNext()}
              >
                Следующий вопрос
              </button>
            </div>
          )}

          {state.phase === "finished" && (
            <div style={{ marginTop: "0.5rem", textAlign: "center", position: "relative", minHeight: 220 }}>
              <ConfettiSalute
                side={
                  state.winner === "blue"
                    ? "blue"
                    : state.winner === "red"
                      ? "red"
                      : state.winner === "draw"
                        ? "both"
                        : "none"
                }
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                <VectorMascot mood="win" size={120} />
                <h3
                  style={{
                    margin: "0.75rem 0",
                    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  }}
                >
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
                <p style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", fontWeight: 900 }}>
                  <span className="team-blue">{state.scores.blue}</span>
                  <span style={{ color: "var(--muted)", margin: "0 0.5rem" }}>:</span>
                  <span className="team-red">{state.scores.red}</span>
                </p>
                <p style={{ color: "var(--muted)", fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}>
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
        fontSize: "clamp(0.95rem, 2.2vw, 1.35rem)",
        marginTop: "0.75rem",
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
