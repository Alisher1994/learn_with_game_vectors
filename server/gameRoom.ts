import type { GamePublicState, TeamId, TeamState } from "../shared/types";
import { VECTOR_QUESTIONS } from "../shared/questions";

const BASE_POINTS = 10;
const SPEED_BONUS = 5;

function emptyTeam(): TeamState {
  return {
    connected: false,
    ready: false,
    avatarId: null,
    className: "",
    groupLabel: "",
    members: [],
    currentAnswer: null,
    answeredAt: null,
  };
}

function publicState(roomId: string, inner: InnerRoom): GamePublicState {
  return {
    roomId,
    phase: inner.phase,
    questionIndex: inner.questionIndex,
    questionStartedAt: inner.questionStartedAt,
    blue: { ...inner.blue },
    red: { ...inner.red },
    scores: { ...inner.scores },
    lastReveal: inner.lastReveal,
    winner: inner.winner,
  };
}

type Phase = "lobby" | "playing" | "between" | "finished";

interface LastReveal {
  correctIndex: number;
  blueChoiceIndex: number | null;
  redChoiceIndex: number | null;
  blueCorrect: boolean;
  redCorrect: boolean;
  blueTimeSec: number | null;
  redTimeSec: number | null;
  fasterTeam: TeamId | null;
  pointsBlue: number;
  pointsRed: number;
}

interface InnerRoom {
  phase: Phase;
  questionIndex: number;
  questionStartedAt: number | null;
  blue: TeamState;
  red: TeamState;
  scores: Record<TeamId, number>;
  lastReveal: LastReveal | null;
  winner: TeamId | "draw" | null;
  /** socket id -> team */
  sockets: Map<string, TeamId>;
}

export class GameRoom {
  readonly roomId: string;
  /** Чтобы не дублировать записи в рейтинге при повторных событиях */
  rankingSaved = false;
  private inner: InnerRoom;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.inner = {
      phase: "lobby",
      questionIndex: 0,
      questionStartedAt: null,
      blue: emptyTeam(),
      red: emptyTeam(),
      scores: { blue: 0, red: 0 },
      lastReveal: null,
      winner: null,
      sockets: new Map(),
    };
  }

  getState(): GamePublicState {
    return publicState(this.roomId, this.inner);
  }

  getQuestionCount(): number {
    return VECTOR_QUESTIONS.length;
  }

  getCurrentQuestion() {
    return VECTOR_QUESTIONS[this.inner.questionIndex] ?? null;
  }

  isTeamAvailable(team: TeamId): boolean {
    return team === "blue" ? !this.inner.blue.connected : !this.inner.red.connected;
  }

  connectTeam(socketId: string, team: TeamId): GamePublicState {
    if (!this.isTeamAvailable(team)) {
      throw new Error("Команда уже занята");
    }
    this.inner.sockets.set(socketId, team);
    if (team === "blue") {
      this.inner.blue.connected = true;
      if (!this.inner.blue.groupLabel) this.inner.blue.groupLabel = "Синий вектор";
    } else {
      this.inner.red.connected = true;
      if (!this.inner.red.groupLabel) this.inner.red.groupLabel = "Красный вектор";
    }
    return this.getState();
  }

  disconnectSocket(socketId: string): GamePublicState {
    const team = this.inner.sockets.get(socketId);
    this.inner.sockets.delete(socketId);
    if (!team) return this.getState();
    const stillOther = [...this.inner.sockets.values()].includes(team);
    if (!stillOther) {
      if (team === "blue") this.inner.blue.connected = false;
      else this.inner.red.connected = false;
    }
    return this.getState();
  }

  updateTeam(
    team: TeamId,
    patch: Partial<
      Pick<TeamState, "avatarId" | "className" | "groupLabel" | "members" | "ready">
    >,
  ): GamePublicState {
    const t = team === "blue" ? this.inner.blue : this.inner.red;
    Object.assign(t, patch);
    return this.getState();
  }

  /** Начать игру, когда обе команды на связи (и по желанию готовы) */
  startGame(): GamePublicState {
    if (!this.inner.blue.connected || !this.inner.red.connected) {
      return this.getState();
    }
    this.rankingSaved = false;
    this.inner.phase = "playing";
    this.inner.questionIndex = 0;
    this.inner.scores = { blue: 0, red: 0 };
    this.inner.lastReveal = null;
    this.inner.winner = null;
    this.resetAnswersForQuestion();
    this.inner.questionStartedAt = Date.now();
    return this.getState();
  }

  private resetAnswersForQuestion() {
    this.inner.blue.currentAnswer = null;
    this.inner.blue.answeredAt = null;
    this.inner.red.currentAnswer = null;
    this.inner.red.answeredAt = null;
  }

  submitAnswer(team: TeamId, choiceIndex: number): GamePublicState {
    if (this.inner.phase !== "playing") return this.getState();
    const q = this.getCurrentQuestion();
    if (!q || choiceIndex < 0 || choiceIndex >= q.options.length) return this.getState();

    const t = team === "blue" ? this.inner.blue : this.inner.red;
    if (t.currentAnswer !== null) return this.getState();

    t.currentAnswer = choiceIndex;
    t.answeredAt = Date.now();

    const other = team === "blue" ? this.inner.red : this.inner.blue;
    if (other.currentAnswer !== null) {
      this.revealAndScore();
    }
    return this.getState();
  }

  private revealAndScore() {
    const q = this.getCurrentQuestion();
    if (!q || !this.inner.questionStartedAt) return;

    const correctIndex = q.correctIndex;
    const blue = this.inner.blue;
    const red = this.inner.red;
    const t0 = this.inner.questionStartedAt;

    const blueCorrect = blue.currentAnswer === correctIndex;
    const redCorrect = red.currentAnswer === correctIndex;

    const blueTimeSec =
      blue.answeredAt != null ? (blue.answeredAt - t0) / 1000 : null;
    const redTimeSec =
      red.answeredAt != null ? (red.answeredAt - t0) / 1000 : null;

    let pointsBlue = 0;
    let pointsRed = 0;
    let fasterTeam: TeamId | null = null;

    if (blueCorrect && redCorrect) {
      const blueFirst =
        blue.answeredAt != null &&
        red.answeredAt != null &&
        blue.answeredAt <= red.answeredAt;
      if (blueFirst) {
        fasterTeam = "blue";
        pointsBlue = BASE_POINTS + SPEED_BONUS;
        pointsRed = BASE_POINTS;
      } else {
        fasterTeam = "red";
        pointsRed = BASE_POINTS + SPEED_BONUS;
        pointsBlue = BASE_POINTS;
      }
    } else if (blueCorrect) {
      pointsBlue = BASE_POINTS + SPEED_BONUS;
    } else if (redCorrect) {
      pointsRed = BASE_POINTS + SPEED_BONUS;
    }

    this.inner.scores.blue += pointsBlue;
    this.inner.scores.red += pointsRed;

    this.inner.lastReveal = {
      correctIndex,
      blueChoiceIndex: blue.currentAnswer,
      redChoiceIndex: red.currentAnswer,
      blueCorrect,
      redCorrect,
      blueTimeSec,
      redTimeSec,
      fasterTeam,
      pointsBlue,
      pointsRed,
    };

    this.inner.phase = "between";
  }

  /** Следующий вопрос или финиш */
  advance(): GamePublicState {
    if (this.inner.phase !== "between") return this.getState();

    const last = this.inner.questionIndex;
    if (last + 1 >= VECTOR_QUESTIONS.length) {
      this.finishGame();
      return this.getState();
    }

    this.inner.questionIndex = last + 1;
    this.inner.lastReveal = null;
    this.resetAnswersForQuestion();
    this.inner.questionStartedAt = Date.now();
    this.inner.phase = "playing";
    return this.getState();
  }

  private finishGame() {
    const b = this.inner.scores.blue;
    const r = this.inner.scores.red;
    if (b > r) this.inner.winner = "blue";
    else if (r > b) this.inner.winner = "red";
    else this.inner.winner = "draw";
    this.inner.phase = "finished";
  }
}
