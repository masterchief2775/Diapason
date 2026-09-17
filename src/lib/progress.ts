import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Instrument } from "./audio";
import type { Lang, Naming } from "./i18n";
import type { ThemeId } from "./theme";
import { LESSON_ORDER } from "./curriculum";
import { pushToast } from "./feed";
import { streakBonus } from "./gamification";

export type SavedPiece = {
  id: string;
  title: string;
  keyRoot: number;
  mode: "majeure" | "mineure";
  progression: number[];
  melody: (number | null)[];
  genre?: string;
  createdAt: number;
};

type ProgressState = {
  completed: string[];
  scores: Record<string, number>;
  xp: number;
  streak: number;
  lastVisit: string | null;
  pieces: SavedPiece[];
  onboarded: boolean;
  challenges: Record<string, number>;
  bestScores: Record<string, number>;
  activity: Record<string, number>;
  instrument: Instrument;
  lang: Lang;
  naming: Naming;
  theme: ThemeId;
  level: string | null;
  updatedAt: number;
  lastSyncAt: number | null;
  hydrateStreak: () => void;
  completeLesson: (id: string, percent: number) => number;
  addXp: (n: number, toastKey?: string) => void;
  savePiece: (piece: Omit<SavedPiece, "id" | "createdAt">) => void;
  deletePiece: (id: string) => void;
  setOnboarded: () => void;
  recordChallenge: (seed: string, pts: number) => void;
  recordBest: (gameId: string, score: number) => boolean;
  logActivity: (n: number) => void;
  resetAll: () => void;
  setInstrument: (i: Instrument) => void;
  setLang: (l: Lang) => void;
  setNaming: (n: Naming) => void;
  setTheme: (t: ThemeId) => void;
  setScore: (id: string, percent: number) => void;
  setLevel: (level: string) => void;
  touch: () => void;
  hydrateFromCloud: (data: CloudProgress) => void;
  setLastSyncAt: (t: number | null) => void;
  isUnlocked: (id: string) => boolean;
  percent: () => number;
};

/** Blob synchronisé dans le cloud (last-write-wins via updatedAt). */
export type CloudProgress = {
  completed: string[];
  scores: Record<string, number>;
  xp: number;
  streak: number;
  lastVisit: string | null;
  pieces: SavedPiece[];
  challenges: Record<string, number>;
  bestScores: Record<string, number>;
  activity: Record<string, number>;
  level: string | null;
  updatedAt: number;
};

export function toCloudProgress(s: ProgressState): CloudProgress {
  return {
    completed: s.completed,
    scores: s.scores,
    xp: s.xp,
    streak: s.streak,
    lastVisit: s.lastVisit,
    pieces: s.pieces,
    challenges: s.challenges,
    bestScores: s.bestScores,
    activity: s.activity,
    level: s.level,
    updatedAt: s.updatedAt,
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: [],
      scores: {},
      xp: 0,
      streak: 0,
      lastVisit: null,
      pieces: [],
      onboarded: false,
      challenges: {},
      bestScores: {},
      activity: {},
      instrument: "guitare",
      lang: "fr",
      naming: "solf",
      theme: "braise",
      level: null,
      updatedAt: 0,
      lastSyncAt: null,
      touch: () => set({ updatedAt: Date.now() }),
      hydrateStreak: () => {
        const t = todayISO();
        const { lastVisit, streak } = get();
        if (lastVisit === t) return;
        if (lastVisit === yesterdayISO()) {
          set({ streak: streak + 1, lastVisit: t });
        } else {
          set({ streak: 1, lastVisit: t });
        }
      },
      completeLesson: (id, percent) => {
        const { completed, scores, xp, streak } = get();
        const prev = scores[id] ?? 0;
        const nextScores = { ...scores, [id]: Math.max(prev, percent) };
        const already = completed.includes(id);
        const pass = percent >= 60;
        const bonus = percent === 100 ? 20 : 0;
        const serie = pass && !already ? streakBonus(streak) : 0;
        const gained = already ? Math.max(0, Math.round((percent - prev) / 10)) : pass ? 40 + bonus + serie : 10;
        set({
          scores: nextScores,
          completed: already || !pass ? completed : [...completed, id],
          xp: xp + gained,
          updatedAt: Date.now(),
        });
        get().logActivity(gained);
        if (gained > 0) pushToast("xp", "feed.lessonDone", { sub: `+${gained} XP` });
        return gained;
      },
      addXp: (n, toastKey) => {
        set({ xp: get().xp + n, updatedAt: Date.now() });
        get().logActivity(n);
        if (toastKey && n > 0) pushToast("xp", toastKey, { sub: `+${n} XP` });
      },
      logActivity: (n: number) => {
        if (n <= 0) return;
        const t = todayISO();
        set({ activity: { ...get().activity, [t]: (get().activity[t] ?? 0) + n } });
      },
      savePiece: (piece) => {
        const item: SavedPiece = {
          ...piece,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set({ pieces: [item, ...get().pieces], xp: get().xp + 15, updatedAt: Date.now() });
        pushToast("xp", "feed.saved", { sub: "+15 XP" });
      },
      deletePiece: (id) => set({ pieces: get().pieces.filter((p) => p.id !== id), updatedAt: Date.now() }),
      setOnboarded: () => set({ onboarded: true }),
      recordChallenge: (seed, pts) => {
        set({
          challenges: { ...get().challenges, [seed]: Math.max(get().challenges[seed] ?? 0, pts) },
          xp: get().xp + pts,
          updatedAt: Date.now(),
        });
        get().logActivity(pts);
        if (pts > 0) pushToast("xp", "feed.challenge", { sub: `+${pts} XP` });
      },
      recordBest: (gameId, score) => {
        const prev = get().bestScores[gameId] ?? 0;
        const improved = score > prev;
        set({ bestScores: { ...get().bestScores, [gameId]: Math.max(prev, score) } });
        if (improved && score > 0) pushToast("record", "feed.record", { sub: `${score}` });
        return improved;
      },
      setInstrument: (instrument) => set({ instrument }),
      setLang: (lang) => set({ lang }),
      setNaming: (naming) => set({ naming }),
      setTheme: (theme) => set({ theme }),
      resetAll: () =>
        set({
          completed: [],
          scores: {},
          xp: 0,
          streak: 0,
          lastVisit: null,
          pieces: [],
          challenges: {},
          bestScores: {},
          activity: {},
          level: null,
          updatedAt: 0,
          lastSyncAt: null,
        }),
      setScore: (id, percent) =>
        set({
          scores: { ...get().scores, [id]: Math.max(get().scores[id] ?? 0, percent) },
          updatedAt: Date.now(),
        }),
      setLevel: (level) => set({ level }),
      hydrateFromCloud: (data) =>
        set({
          completed: data.completed,
          scores: data.scores,
          xp: data.xp,
          streak: data.streak,
          lastVisit: data.lastVisit,
          pieces: data.pieces,
          challenges: data.challenges,
          bestScores: data.bestScores,
          activity: data.activity,
          level: data.level,
          updatedAt: data.updatedAt,
        }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      isUnlocked: (id) => {
        const idx = LESSON_ORDER.indexOf(id);
        if (idx <= 0) return true;
        const { completed } = get();
        return completed.includes(LESSON_ORDER[idx - 1]);
      },
      percent: () => {
        const n = LESSON_ORDER.length;
        if (!n) return 0;
        return Math.round((get().completed.length / n) * 100);
      },
    }),
    {
      name: "diapason-progress-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
