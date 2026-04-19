import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { io, Socket } from "socket.io-client";
import type { GamePublicState, TeamId, TeamState } from "@shared/types";
import { VECTOR_QUESTIONS } from "@shared/questions";
import { AiRobotMascot } from "../components/AiRobotMascot";
import { HostConfettiLottie } from "../components/HostConfettiLottie";
import { HostWaitAstronaut } from "../components/HostWaitAstronaut";
import { HOST_LOTTIE } from "../data/hostLottiePaths";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { TEAM_AVATARS } from "../data/avatars";
import { api, getSocketUrl, SOCKET_OPTIONS } from "../socketUrl";
import { getQuestionCopy, t, type Lang, useI18n } from "../i18n";

const MAX_POINTS_CAP = VECTOR_QUESTIONS.length * 15;

function fightBarPercent(score: number): number {
  return Math.min(100, (score / MAX_POINTS_CAP) * 100);
}

function FightHud({
  scores,
  questionIndex,
  phase,
  lang,
}: {
  scores: { blue: number; red: number };
  questionIndex: number;
  phase: GamePublicState["phase"];
  lang: Lang;
}) {
  const copy = t[lang];
  const bp = fightBarPercent(scores.blue);
  const rp = fightBarPercent(scores.red);
  const roundLabel =
    phase === "finished"
      ? copy.gameOver
      : copy.roundOf(questionIndex + 1, VECTOR_QUESTIONS.length);

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

function AnswerArenaStrip({ state, lang }: { state: GamePublicState; lang: Lang }) {
  const copy = t[lang];
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
          {blueDone ? copy.blueAnswered : copy.blueWaiting}
        </div>
        <div className="answer-arena__sub">
          {blueDone ? (redDone ? "" : copy.waitRed) : copy.waitingAnswer}
        </div>
        {!blueDone && redDone ? <HostWaitAstronaut /> : null}
      </div>
      <div
        className={[
          "answer-arena__side answer-arena__side--red",
          redDone ? "answer-arena__side--active-red" : "answer-arena__side--wait",
        ].join(" ")}
      >
        <div className="answer-arena__big team-red">
          {redDone ? copy.redAnswered : copy.redWaiting}
        </div>
        <div className="answer-arena__sub">
          {redDone ? (blueDone ? "" : copy.waitBlue) : copy.waitingAnswer}
        </div>
        {blueDone && !redDone ? <HostWaitAstronaut /> : null}
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
  lang,
}: {
  title: string;
  colorVar: string;
  joinSuffix: "blue" | "red";
  joinBase: string;
  qrDataUrl: string;
  team: TeamState | undefined;
  lang: Lang;
}) {
  const copy = t[lang];
  const connected = team?.connected ?? false;
  const ready = team?.ready ?? false;
  const showQr = !connected || !ready;
  const url = `${joinBase}/${joinSuffix}`;

  return (
    <div
      style={{
        borderRadius: 12,
        padding: "0.75rem",
        background: "var(--surface-soft)",
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
            <div style={{ marginTop: 8, fontWeight: 800, color: "var(--ok)" }}>
              {copy.readyShort}
            </div>
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
        {!connected && <span style={{ color: "var(--muted)" }}>{copy.waitQr}</span>}
        {connected && !ready && <span style={{ color: "var(--warn)" }}>{copy.onlineFilling}</span>}
        {connected && ready && <span style={{ color: "var(--ok)" }}>{copy.onlineReady}</span>}
      </div>
    </div>
  );
}

export function HostPage() {
  const { roomId = "" } = useParams();
  const { lang } = useI18n();
  const copy = t[lang];
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
    void QRCode.toDataURL(`${joinBase}/blue`, { margin: 1, width: 220 }).then(setQrBlue);
    void QRCode.toDataURL(`${joinBase}/red`, { margin: 1, width: 220 }).then(setQrRed);
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
  const qCopy = useMemo(() => (q ? getQuestionCopy(q, lang) : null), [q, lang]);

  const bothIn = state?.blue.connected && state?.red.connected && state.phase === "lobby";
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
          {copy.backHome}
        </Link>
        <span style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
          {copy.room}: <strong style={{ color: "var(--text)" }}>{roomId}</strong>
        </span>
      </div>

      {state && state.phase !== "lobby" && (
        <FightHud
          scores={state.scores}
          questionIndex={state.questionIndex}
          phase={state.phase}
          lang={lang}
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
          <AiRobotMascot mood={state?.phase === "finished" ? "win" : "happy"} size={144} />
          <div>
            <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.6rem" }}>{copy.arenaTitle}</h2>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.5 }}>{copy.arenaText}</p>
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
            title={copy.blueTeam}
            colorVar="var(--blue)"
            joinSuffix="blue"
            joinBase={joinBase}
            qrDataUrl={qrBlue}
            team={state?.blue}
            lang={lang}
          />
          <TeamLobbyBlock
            title={copy.redTeam}
            colorVar="var(--red)"
            joinSuffix="red"
            joinBase={joinBase}
            qrDataUrl={qrRed}
            team={state?.red}
            lang={lang}
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
            {copy.blueStatus}:{" "}
            <strong className="team-blue">
              {!state?.blue.connected ? copy.waitingOnline : state.blue.ready ? copy.readyShort : copy.online}
            </strong>
          </span>
          <span>
            {copy.redStatus}:{" "}
            <strong className="team-red">
              {!state?.red.connected ? copy.waitingOnline : state.red.ready ? copy.readyShort : copy.online}
            </strong>
          </span>
          {bothIn && !bothReady && (
            <span style={{ color: "var(--muted)", width: "100%", textAlign: "center" }}>
              {copy.waitReady}
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
            {copy.startGame}
            {bothReady ? "" : copy.maybeBeforeReady}
          </button>
        )}
      </div>

      {state && state.phase !== "lobby" && (
        <div className="card host-game-card" style={{ marginBottom: "1rem" }}>
          {state.phase === "playing" && qCopy && (
            <>
              <AnswerArenaStrip state={state} lang={lang} />
              <h3 className="host-question">{qCopy.text}</h3>
              <ul className="host-options">
                {qCopy.options.map((o, i) => (
                  <li key={i}>
                    <span className="host-options__letter">{String.fromCharCode(65 + i)}.</span>{" "}
                    {o}
                  </li>
                ))}
              </ul>
            </>
          )}

          {state.phase === "between" && state.lastReveal && qCopy && (
            <div style={{ position: "relative", minHeight: 280 }}>
              <HostConfettiLottie side={confettiSideFromReveal(state.lastReveal)} />
              <AnswerArenaStrip state={state} lang={lang} />
              <div className="host-correct-box">
                <div className="host-correct-box__label">{copy.correctOption}</div>
                <div className="host-correct-box__text">
                  {String.fromCharCode(65 + state.lastReveal.correctIndex)}.{" "}
                  {qCopy.options[state.lastReveal.correctIndex]}
                </div>
              </div>
              <RevealShowcase
                last={state.lastReveal}
                labels={{ blue: state.blue.groupLabel, red: state.red.groupLabel }}
                options={qCopy.options}
                lang={lang}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: "1rem", width: "100%", fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                onClick={() => emitNext()}
              >
                {copy.nextQuestion}
              </button>
            </div>
          )}

          {state.phase === "finished" && (
            <div className="winner-stage">
              <HostConfettiLottie
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
                <div className="winner-stage__mascot">
                  <AiRobotMascot mood="win" size={176} />
                </div>
                <h3 className="winner-stage__title">
                  {state.winner === "draw" && copy.draw}
                  {state.winner === "blue" && (
                    <>
                      {copy.winners} <span className="team-blue">{state.blue.groupLabel || copy.blueTeam}</span>
                    </>
                  )}
                  {state.winner === "red" && (
                    <>
                      {copy.winners} <span className="team-red">{state.red.groupLabel || copy.redTeam}</span>
                    </>
                  )}
                </h3>
                <p className="winner-stage__score">
                  <span className="team-blue">{state.scores.blue}</span>
                  <span style={{ color: "var(--muted)", margin: "0 0.5rem" }}>:</span>
                  <span className="team-red">{state.scores.red}</span>
                </p>
                <p className="winner-stage__note">{copy.rankingSaved}</p>
                <div className="host-trophy-wrap">
                  <DotLottieReact
                    src={HOST_LOTTIE.trophy}
                    loop
                    autoplay
                    aria-label="Кубок"
                    style={{
                      width: "min(92vw, 440px)",
                      height: "min(38vh, 300px)",
                    }}
                  />
                </div>
                <Link
                  to="/ratings"
                  className="btn btn-ghost"
                  style={{ marginTop: "0.75rem", display: "inline-flex" }}
                >
                  {copy.openRanking}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RevealShowcase({
  last,
  labels,
  options,
  lang,
}: {
  last: NonNullable<GamePublicState["lastReveal"]>;
  labels: { blue: string; red: string };
  options: string[];
  lang: Lang;
}) {
  const copy = t[lang];
  const rows: {
    team: TeamId;
    label: string;
    time: number | null;
    ok: boolean;
    pts: number;
    choiceIndex: number | null;
  }[] = [
    {
      team: "blue",
      label: labels.blue || copy.blueTeam,
      time: last.blueTimeSec,
      ok: last.blueCorrect,
      pts: last.pointsBlue,
      choiceIndex: last.blueChoiceIndex,
    },
    {
      team: "red",
      label: labels.red || copy.redTeam,
      time: last.redTimeSec,
      ok: last.redCorrect,
      pts: last.pointsRed,
      choiceIndex: last.redChoiceIndex,
    },
  ].sort((a, b) => {
    if (a.time == null) return 1;
    if (b.time == null) return -1;
    return a.time - b.time;
  });

  return (
    <div className="result-showcase">
      <div className="reveal-cards">
        {rows.map((r) => {
          const isFastest =
            last.fasterTeam === r.team && last.blueCorrect && last.redCorrect;

          return (
            <div
              key={r.team}
              className={`reveal-card reveal-card--${r.team}`}
              style={{ color: r.team === "blue" ? "var(--blue)" : "var(--red)" }}
            >
              <div className="reveal-card__topline">
                <h4 className="reveal-card__title">{r.label}</h4>
                <div
                  style={{
                    display: "flex",
                    gap: "0.45rem",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    className={`reveal-badge ${r.ok ? "reveal-badge--ok" : "reveal-badge--miss"}`}
                  >
                    {r.ok ? copy.correct : copy.wrong}
                  </span>
                  {isFastest && <span className="reveal-badge reveal-badge--fast">{copy.fastest}</span>}
                </div>
              </div>

              <div className="reveal-stat-grid">
                <div className="reveal-stat">
                  <span className="reveal-stat__label">{copy.time}</span>
                  <span className="reveal-stat__value">
                    {r.time != null ? `${r.time.toFixed(2)} c` : "—"}
                  </span>
                </div>
                <div className="reveal-stat">
                  <span className="reveal-stat__label">{copy.score}</span>
                  <span className="reveal-stat__value">+{r.pts}</span>
                </div>
              </div>

              <div className="reveal-choice">
                <span className="reveal-choice__label">{copy.chosenAnswer}</span>
                <span className="reveal-choice__value">
                  {r.choiceIndex != null
                    ? `${String.fromCharCode(65 + r.choiceIndex)}. ${options[r.choiceIndex] ?? "—"}`
                    : copy.noAnswer}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
