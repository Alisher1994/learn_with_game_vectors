import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import type { ClassEntry, GamePublicState, TeamId } from "@shared/types";
import { VECTOR_QUESTIONS } from "@shared/questions";
import { TEAM_AVATARS } from "../data/avatars";
import { AiRobotMascot } from "../components/AiRobotMascot";
import { api, getSocketUrl, SOCKET_OPTIONS } from "../socketUrl";
import { getQuestionCopy, t, useI18n } from "../i18n";
function isTeam(s: string | undefined): s is TeamId {
  return s === "blue" || s === "red";
}

export function JoinPage() {
  const { roomId = "", team: teamParam } = useParams();
  const { lang } = useI18n();
  const copy = t[lang];
  const team = isTeam(teamParam) ? teamParam : "blue";
  const socketUrl = getSocketUrl();
  const socketRef = useRef<Socket | null>(null);

  const [state, setState] = useState<GamePublicState | null>(null);
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [className, setClassName] = useState("");
  const [groupLabel, setGroupLabel] = useState(
    team === "blue" ? copy.blueVector : copy.redVector,
  );
  const [members, setMembers] = useState<string[]>([""]);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [pickedClassId, setPickedClassId] = useState<string>("");

  /** Актуальные поля для emit без устаревших замыканий */
  const teamPayloadRef = useRef({
    className: "",
    groupLabel: "",
    members: [] as string[],
    avatarId: null as string | null,
    ready: false,
  });
  teamPayloadRef.current = {
    className,
    groupLabel,
    members: members.map((m) => m.trim()).filter(Boolean),
    avatarId,
    ready,
  };

  /** Пока join не подтверждён, сервер игнорирует updateTeam — ждём ack */
  const canEmitRef = useRef(false);

  const emitUpdate = useCallback(() => {
    if (!canEmitRef.current || !socketRef.current?.connected) return;
    const p = teamPayloadRef.current;
    socketRef.current.emit("updateTeam", {
      className: p.className,
      groupLabel: p.groupLabel,
      members: p.members,
      avatarId: p.avatarId,
      ready: p.ready,
    });
  }, []);

  useEffect(() => {
    void api<ClassEntry[]>("/api/classes").then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    void api<GamePublicState>(`/api/rooms/${roomId}/state`)
      .then(setState)
      .catch(() => setState(null));
  }, [roomId]);

  useEffect(() => {
    const s: Socket = io(socketUrl, { ...SOCKET_OPTIONS });
    socketRef.current = s;
    canEmitRef.current = false;
    s.on("connect", () => {
      s.emit("join", { roomId, team }, () => {
        canEmitRef.current = true;
        emitUpdate();
      });
    });
    s.on("disconnect", () => {
      canEmitRef.current = false;
    });
    s.on("state", (st: GamePublicState) => setState(st));
    return () => {
      canEmitRef.current = false;
      socketRef.current = null;
      s.disconnect();
    };
  }, [roomId, team, socketUrl, emitUpdate]);

  /** «Готовы» и аватар — сразу, без debounce */
  useEffect(() => {
    emitUpdate();
  }, [ready, avatarId, emitUpdate]);

  /** Текстовые поля — реже, чтобы не спамить сервер */
  useEffect(() => {
    const t = window.setTimeout(() => emitUpdate(), 280);
    return () => window.clearTimeout(t);
  }, [className, groupLabel, members, emitUpdate]);

  const q = useMemo(() => {
    if (!state || state.phase !== "playing") return null;
    return VECTOR_QUESTIONS[state.questionIndex] ?? null;
  }, [state]);
  const qCopy = useMemo(() => (q ? getQuestionCopy(q, lang) : null), [q, lang]);

  const teamColor = team === "blue" ? "var(--blue)" : "var(--red)";
  const teamLabel = team === "blue" ? copy.blueTeam : copy.redTeam;

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
        <div className="card">{copy.teamInvalidLink}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="join-shell">
        <div className="card join-stage">
          <div className="join-header">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AiRobotMascot mood="happy" size={132} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.8rem", color: teamColor }}>
                {teamLabel}
              </h1>
              <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                {copy.joinIntro}
              </p>
              <div className="join-chip">{copy.room} {roomId}</div>
            </div>
          </div>
        </div>

        {state?.phase === "lobby" && (
          <div className="card">
            <h2 className="join-card-title">{copy.assembleTeam}</h2>
            <p className="join-card-subtitle">{copy.assembleText}</p>

            <label className="label">{copy.teamAvatar}</label>
            <div className="avatar-grid">
              {TEAM_AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`avatar-pill ${avatarId === a.id ? "avatar-pill--active" : ""}`}
                  onClick={() => setAvatarId(a.id)}
                  style={{
                    outline: avatarId === a.id ? `2px solid ${teamColor}` : undefined,
                    boxShadow:
                      avatarId === a.id ? `0 14px 28px ${teamColor}33` : undefined,
                  }}
                  title={a.label}
                >
                  <span>{a.emoji}</span>
                </button>
              ))}
            </div>

            {classes.length > 0 && (
              <>
                <label className="label">{copy.classFromDirectory}</label>
                <select
                  className="input"
                  value={pickedClassId}
                  onChange={(e) => applyClassFromList(e.target.value)}
                  style={{ marginBottom: "0.75rem" }}
                >
                  <option value="">{copy.choose}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.students.length} {copy.studentsShort})
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="join-grid">
              <div>
                <label className="label">{copy.classLabel}</label>
                <input
                  className="input"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="8А"
                  style={{ marginBottom: "0.75rem" }}
                />
              </div>

              <div>
                <label className="label">{copy.groupName}</label>
                <input
                  className="input"
                  value={groupLabel}
                  onChange={(e) => setGroupLabel(e.target.value)}
                  style={{ marginBottom: "0.75rem" }}
                />
              </div>
            </div>

            <label className="label">{copy.members}</label>
            <div className="member-list">
              {members.map((m, i) => (
                <input
                  key={i}
                  className="input"
                  value={m}
                  onChange={(e) => setMember(i, e.target.value)}
                  placeholder={copy.memberPlaceholder(i + 1)}
                />
              ))}
            </div>
            <button type="button" className="btn btn-ghost" onClick={addMember} style={{ marginTop: "0.65rem" }}>
              {copy.addMember}
            </button>

            <label className="join-ready">
              <input
                type="checkbox"
                checked={ready}
                onChange={(e) => setReady(e.target.checked)}
              />
              <span>
                <strong style={{ display: "block", marginBottom: 4 }}>{copy.readyTitle}</strong>
                {copy.readyText}
              </span>
            </label>
          </div>
        )}

        {state && state.phase === "playing" && q && qCopy && (
          <div className="card quiz-shell">
            <div className="quiz-topline">
              <div className="quiz-step">
                {copy.questionOf(state.questionIndex + 1, VECTOR_QUESTIONS.length)}
              </div>
              <div style={{ color: teamColor, fontWeight: 800 }}>{groupLabel}</div>
            </div>
            <h2 className="quiz-question">{qCopy.text}</h2>
            <div className="quiz-options">
              {qCopy.options.map((opt, i) => {
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
                    className="btn quiz-option"
                    disabled={disabled}
                    onClick={() => submitAnswer(i)}
                    style={{
                      background: isMine ? `${teamColor}22` : "rgba(255,255,255,0.08)",
                      border: isMine ? `2px solid ${teamColor}` : "1px solid var(--card-border)",
                    }}
                  >
                    <span className="quiz-option__letter">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {(team === "blue" ? state.blue : state.red).currentAnswer !== null && (
              <p className="quiz-status">{copy.answerSent}</p>
            )}
          </div>
        )}

        {state && state.phase === "between" && (
          <div className="card">
            <p style={{ margin: 0 }}>{copy.countingOnScreen}</p>
          </div>
        )}

        {state && state.phase === "finished" && (
          <div className="card" style={{ textAlign: "center" }}>
            <p>{copy.gameFinished}</p>
            <Link to="/ratings" className="btn btn-ghost" style={{ marginTop: "0.75rem" }}>
              {copy.rating}
            </Link>
          </div>
        )}

        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
          {copy.tipDirectory}
        </p>
      </div>
    </div>
  );
}
