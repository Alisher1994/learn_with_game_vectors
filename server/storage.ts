import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ClassEntry } from "../shared/types";

const here = path.dirname(fileURLToPath(import.meta.url));
/** `data/` в корне проекта и при `tsx server/...`, и при `node server/dist/...` */
const dataDir =
  path.basename(here) === "dist"
    ? path.join(here, "..", "..", "data")
    : path.join(here, "..", "data");

export interface RankingEntry {
  id: string;
  createdAt: string;
  roomId: string;
  className: string;
  groupLabel: string;
  team: "blue" | "red";
  score: number;
  members: string[];
}

export interface StoreData {
  rankings: RankingEntry[];
  classes: ClassEntry[];
}

const storePath = path.join(dataDir, "store.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readStore(): StoreData {
  ensureDataDir();
  if (!fs.existsSync(storePath)) {
    return { rankings: [], classes: [] };
  }
  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      rankings: Array.isArray(parsed.rankings) ? parsed.rankings : [],
      classes: Array.isArray(parsed.classes) ? parsed.classes : [],
    };
  } catch {
    return { rankings: [], classes: [] };
  }
}

function writeStore(data: StoreData) {
  ensureDataDir();
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getRankings(): RankingEntry[] {
  return [...readStore().rankings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function addRanking(entry: Omit<RankingEntry, "id" | "createdAt">): RankingEntry {
  const store = readStore();
  const full: RankingEntry = {
    ...entry,
    id: `rk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  store.rankings.push(full);
  writeStore(store);
  return full;
}

export function getClasses(): ClassEntry[] {
  return readStore().classes;
}

export function saveClasses(classes: ClassEntry[]) {
  const store = readStore();
  store.classes = classes;
  writeStore(store);
}
