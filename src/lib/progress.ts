import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LESSON_ORDER } from "./curriculum";

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
  level: string | null;
  hydrateStreak: () => void;
  completeLesson: (id: string, percent: number) => void;
  addXp: (n: number) => void;
  savePiece: (piece: Omit<SavedPiece, "id" | "createdAt">) => void;
  deletePiece: (id: string) => void;
  setOnboarded: () => void;
  recordChallenge: (seed: string, pts: number) => void;
  recordBest: (gameId: string, score: number) => void;
  setScore: (id: string, percent: number) => void;
  setLevel: (level: string) => void;
  isUnlocked: (id: string) => boolean;
  percent: () => number;
};

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
      level: null,
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
        const { completed, scores, xp } = get();
        const prev = scores[id] ?? 0;
        const nextScores = { ...scores, [id]: Math.max(prev, percent) };
        const already = completed.includes(id);
        const pass = percent >= 60;
        const bonus = percent === 100 ? 20 : 0;
        set({
          scores: nextScores,
          completed: already || !pass ? completed : [...completed, id],
          xp: already ? xp + Math.max(0, Math.round((percent - prev) / 10)) : pass ? xp + 40 + bonus : xp + 10,
        });
      },
      addXp: (n) => set({ xp: get().xp + n }),
      savePiece: (piece) => {
        const item: SavedPiece = {
          ...piece,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set({ pieces: [item, ...get().pieces], xp: get().xp + 15 });
      },
      deletePiece: (id) => set({ pieces: get().pieces.filter((p) => p.id !== id) }),
      setOnboarded: () => set({ onboarded: true }),
      recordChallenge: (seed, pts) =>
        set({ challenges: { ...get().challenges, [seed]: Math.max(get().challenges[seed] ?? 0, pts) }, xp: get().xp + pts }),
      recordBest: (gameId, score) =>
        set({ bestScores: { ...get().bestScores, [gameId]: Math.max(get().bestScores[gameId] ?? 0, score) } }),
      setScore: (id, percent) =>
        set({ scores: { ...get().scores, [id]: Math.max(get().scores[id] ?? 0, percent) } }),
      setLevel: (level) => set({ level }),
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
