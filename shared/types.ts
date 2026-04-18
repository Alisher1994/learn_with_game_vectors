export type TeamId = "blue" | "red";

export interface ClassEntry {
  id: string;
  name: string;
  students: string[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  hint?: string;
}

export interface TeamState {
  connected: boolean;
  ready: boolean;
  avatarId: string | null;
  className: string;
  /** Display label e.g. «Синий вектор» */
  groupLabel: string;
  /** Участники команды (ФИО), можно бесконечно */
  members: string[];
  /** Выбранный ответ на текущий вопрос (индекс) */
  currentAnswer: number | null;
  /** Время ответа (ms с начала эпохи), для сравнения скорости */
  answeredAt: number | null;
}

export interface GamePublicState {
  roomId: string;
  phase: "lobby" | "playing" | "between" | "finished";
  /** Индекс текущего вопроса (0-based) */
  questionIndex: number;
  /** Когда начался текущий вопрос (для таймера) */
  questionStartedAt: number | null;
  blue: TeamState;
  red: TeamState;
  scores: Record<TeamId, number>;
  /** После reveal: кто был быстрее при обоих верных */
  lastReveal: {
    correctIndex: number;
    blueCorrect: boolean;
    redCorrect: boolean;
    blueTimeSec: number | null;
    redTimeSec: number | null;
    fasterTeam: TeamId | null;
    pointsBlue: number;
    pointsRed: number;
  } | null;
  winner: TeamId | "draw" | null;
}
