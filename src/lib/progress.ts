import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Instrument } from "./audio";
import type { Lang, Naming } from "./i18n";
import type { ThemeId } from "./theme";
import { LESSON_ORDER } from "./curriculum";
import { pushToast } from "./feed";
import { localDayISO, localYesterdayISO, streakBonus } from "./gamification";

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
  savePiece: (piece: Omit<SavedPiece, "id" | "createdAt">) => boolean;
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
  return localDayISO();
}

function yesterdayISO() {
  return localYesterdayISO();
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
          set({ streak: streak + 1, lastVisit: t, updatedAt: Date.now() });
        } else {
          set({ streak: 1, lastVisit: t, updatedAt: Date.now() });
        }
      },
      completeLesson: (id, percent) => {
        const { completed, scores, xp, streak } = get();
        const prev = scores[id] ?? 0;
        const nextScores = { ...scores, [id]: Math.max(prev, percent) };
        const already = completed.includes(id);
        const attempted = scores[id] !== undefined;
        const pass = percent >= 60;
        const bonus = percent === 100 ? 20 : 0;
        const serie = pass && !already ? streakBonus(streak) : 0;
        // Anti-farming : un échec ne paie les +10 XP de consolation qu'à la
        // première tentative ; ensuite il faut valider (ou améliorer un acquis).
        const gained = already ? Math.max(0, Math.round((percent - prev) / 10)) : pass ? 40 + bonus + serie : attempted ? 0 : 10;
        set({
          scores: nextScores,
          completed: already || !pass ? completed : [...completed, id],
          xp: xp + gained,
          updatedAt: Date.now(),
        });
        get().logActivity(gained);
        if (gained > 0 && !already) pushToast("xp", "feed.lessonDone", { sub: `+${gained} XP` });
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
        const sig = (p: SavedPiece) =>
          [p.title, p.keyRoot, p.mode, JSON.stringify(p.progression), JSON.stringify(p.melody), p.genre ?? ""].join("|");
        // Anti-doublon : réenregistrer la pièce la plus récente à l'identique
        // ne crée ni entrée ni XP (clic double, spam).
        const [last] = get().pieces;
        const newSig = sig({ ...piece, id: "", createdAt: 0 });
        if (last != null && sig(last) === newSig) return false;
        const item: SavedPiece = {
          ...piece,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        // Anti-farming : +15 XP seulement si la pièce est inédite dans les
        // 10 dernières (alterner deux pièces ne paie plus à l'infini).
        const fresh = !get().pieces.slice(0, 10).some((p) => sig(p) === newSig);
        set({ pieces: [item, ...get().pieces], xp: get().xp + (fresh ? 15 : 0), updatedAt: Date.now() });
        if (fresh) {
          get().logActivity(15);
          pushToast("xp", "feed.saved", { sub: "+15 XP" });
        }
        return true;
      },
      deletePiece: (id) => set({ pieces: get().pieces.filter((p) => p.id !== id), updatedAt: Date.now() }),
      setOnboarded: () => set({ onboarded: true }),
      recordChallenge: (seed, pct) => {
        // `pct` est un vrai pourcentage (affiché tel quel) ; seul le gain
        // d'XP est compressé (÷10) et seule l'amélioration paie.
        const prev = get().challenges[seed] ?? 0;
        const gain = Math.max(0, Math.round((pct - prev) / 10));
        set({
          challenges: { ...get().challenges, [seed]: Math.max(prev, pct) },
          xp: get().xp + gain,
          updatedAt: Date.now(),
        });
        get().logActivity(gain);
        if (gain > 0) pushToast("xp", "feed.challenge", { sub: `+${gain} XP` });
      },
      recordBest: (gameId, score) => {
        const prev = get().bestScores[gameId] ?? 0;
        const improved = score > prev;
        // updatedAt bumpé même sans amélioration : le record (et l'activité
        // qu'il implique) doit survivre au last-write-wins, pas être écrasé.
        set({ bestScores: { ...get().bestScores, [gameId]: Math.max(prev, score) }, updatedAt: Date.now() });
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
      setLevel: (level) => set({ level, updatedAt: Date.now() }),
      hydrateFromCloud: (data) =>
        set({
          completed: Array.isArray(data.completed) ? data.completed.filter((x) => typeof x === "string") : [],
          scores: data.scores && typeof data.scores === "object" ? data.scores : {},
          xp: typeof data.xp === "number" ? data.xp : 0,
          streak: typeof data.streak === "number" ? data.streak : 0,
          lastVisit: typeof data.lastVisit === "string" ? data.lastVisit : null,
          pieces: Array.isArray(data.pieces) ? data.pieces : [],
          challenges: data.challenges && typeof data.challenges === "object" ? data.challenges : {},
          bestScores: data.bestScores && typeof data.bestScores === "object" ? data.bestScores : {},
          activity: data.activity && typeof data.activity === "object" ? data.activity : {},
          level: typeof data.level === "string" ? data.level : null,
          updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
        }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      isUnlocked: (id) => {
        const idx = LESSON_ORDER.indexOf(id);
        if (idx === 0) return true;
        if (idx < 0) return false;
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
      version: 1,
      // Stockage défensif : quota dépassé ou JSON corrompu → on ignore au lieu
      // de jeter (une entrée corrompue repart de zéro plutôt que de crasher).
      storage: createJSONStorage(() => ({
        getItem: (key: string) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw == null) return null;
            JSON.parse(raw);
            return raw;
          } catch {
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch {
            /* quota plein : la session continue en mémoire */
          }
        },
        removeItem: (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch {
            /* noop */
          }
        },
      })),
      skipHydration: true,
    },
  ),
);
