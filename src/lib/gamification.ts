import type { Lang } from "./i18n";
import { LESSONS, LESSON_ORDER } from "./curriculum";

const TOTAL = LESSON_ORDER.length;
const PHASE1 = LESSONS.filter((l) => l.phase === 1).map((l) => l.id);

export type BadgeIcon =
  | "sprout"
  | "hammer"
  | "music"
  | "sparkles"
  | "ear"
  | "pen"
  | "flame"
  | "zap"
  | "trophy"
  | "star"
  | "disc"
  | "compass"
  | "guitar"
  | "drum"
  | "medal";

export type Badge = {
  id: string;
  title: string;
  desc: string;
  /** Clé de logo (voir BADGE_ICONS dans components/badges.tsx). */
  icon: BadgeIcon;
  /** Couleur d'accent du médaillon (hex). */
  accent: string;
  test: (args: { xp: number; streak: number; completed: string[]; pieces: number; scores: Record<string, number> }) => boolean;
};

export const BADGES: Badge[] = [
  { id: "first-steps", title: "Premiers pas", desc: "Terminer 1 leçon.", icon: "sprout", accent: "#7fb069", test: (a) => a.completed.length >= 1 },
  { id: "assidu", title: "Assidu", desc: "3 jours d'affilée.", icon: "flame", accent: "#e07a3f", test: (a) => a.streak >= 3 },
  { id: "fondations", title: "Bâtisseur", desc: "Terminer les 5 leçons de Phase 1.", icon: "hammer", accent: "#c9a227", test: (a) => PHASE1.every((id) => a.completed.includes(id)) },
  { id: "harmoniste", title: "Harmoniste", desc: "Terminer 10 leçons.", icon: "music", accent: "#6aa9d8", test: (a) => a.completed.length >= 10 },
  { id: "explorateur", title: "Explorateur", desc: "Terminer 15 leçons.", icon: "compass", accent: "#4fa3a3", test: (a) => a.completed.length >= 15 },
  { id: "sans-faute", title: "Sans faute", desc: "100 % quelque part (leçon ou oreille).", icon: "star", accent: "#e5c158", test: (a) => Object.values(a.scores).some((v) => v >= 100) },
  { id: "maitre-modes", title: "Maître des modes", desc: "90 %+ à la leçon des modes.", icon: "sparkles", accent: "#a678e0", test: (a) => (a.scores["modes"] ?? 0) >= 90 },
  { id: "oreille-or", title: "Oreille d'or", desc: "Score parfait à l'oreille (8/8).", icon: "ear", accent: "#e0a83f", test: (a) => (a.scores["oreille-parfait"] ?? 0) >= 100 },
  { id: "bassiste", title: "Bassiste", desc: "Réussir le quiz de la basse (≥ 60 %).", icon: "guitar", accent: "#8a6fd8", test: (a) => (a.scores["basse"] ?? 0) >= 60 },
  { id: "batteur", title: "Batteur", desc: "Réussir le quiz de la batterie (≥ 60 %).", icon: "drum", accent: "#d86a5a", test: (a) => (a.scores["batterie"] ?? 0) >= 60 },
  { id: "basse-expert", title: "Bassiste confirmé", desc: "Valider l'examen du bassiste (≥ 60 %).", icon: "medal", accent: "#8a6fd8", test: (a) => (a.scores["basse-examen"] ?? 0) >= 60 },
  { id: "bat-expert", title: "Batteur confirmé", desc: "Valider l'examen du batteur (≥ 60 %).", icon: "medal", accent: "#d86a5a", test: (a) => (a.scores["bat-examen"] ?? 0) >= 60 },
  { id: "collectionneur", title: "Collectionneur", desc: "Enregistrer 1 pièce au carnet.", icon: "disc", accent: "#d86a8a", test: (a) => a.pieces >= 1 },
  { id: "compositeur", title: "Compositeur confirmé", desc: "Enregistrer 3 pièces au carnet.", icon: "pen", accent: "#d86a8a", test: (a) => a.pieces >= 3 },
  { id: "streak7", title: "Série de 7", desc: "7 jours d'affilée.", icon: "flame", accent: "#e0523f", test: (a) => a.streak >= 7 },
  { id: "xp500", title: "500 XP", desc: "Cumuler 500 XP.", icon: "zap", accent: "#e5c158", test: (a) => a.xp >= 500 },
  { id: "virtuose", title: "Virtuose", desc: "Cumuler 1500 XP.", icon: "trophy", accent: "#c9a227", test: (a) => a.xp >= 1500 },
  { id: "finisher", title: "Maître Diapason", desc: `Terminer les ${TOTAL} leçons.`, icon: "trophy", accent: "#d4c4a0", test: (a) => a.completed.length >= TOTAL },
];

export function earnedBadges(args: {
  xp: number;
  streak: number;
  completed: string[];
  pieces: number;
  scores: Record<string, number>;
}): Badge[] {
  return BADGES.filter((b) => {
    try {
      return b.test(args);
    } catch {
      return false;
    }
  });
}

export function titleFor(args: { completed: number; xp: number }): string {
  if (args.completed >= TOTAL) return "Maître Diapason";
  if (args.completed >= TOTAL - 5) return "Compositeur confirmé";
  if (args.completed >= TOTAL - 9) return "Maître des modes (en devenir)";
  if (args.completed >= 5) return "Harmoniste junior";
  if (args.completed >= 1) return "Apprenti du manche";
  return "Débutant motivé";
}

const TITLE_EN: Record<string, string> = {
  "Maître Diapason": "Diapason Master",
  "Compositeur confirmé": "Confirmed composer",
  "Maître des modes (en devenir)": "Mode master (in training)",
  "Harmoniste junior": "Junior harmonist",
  "Apprenti du manche": "Fretboard apprentice",
  "Débutant motivé": "Motivated beginner",
};

export function titleText(lang: Lang, args: { completed: number; xp: number }): string {
  const fr = titleFor(args);
  return lang === "en" ? (TITLE_EN[fr] ?? fr) : fr;
}

/* ---------- Niveaux (dopamine saine) ---------- */

/** XP cumulés requis pour atteindre le niveau n (n ≥ 1). */
export function xpForLevel(n: number): number {
  if (n <= 1) return 0;
  return 50 * n * (n - 1);
}

/** Niveau courant pour un total d'XP. */
export function levelForXp(xp: number): number {
  let n = 1;
  while (xpForLevel(n + 1) <= Math.max(0, xp)) n++;
  return n;
}

/** Progression 0..1 vers le niveau suivant. */
export function xpProgress(xp: number): { level: number; cur: number; next: number; pct: number } {
  const level = levelForXp(xp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = next <= cur ? 1 : Math.min(1, Math.max(0, (xp - cur) / (next - cur)));
  return { level, cur, next, pct };
}

/** Date locale AAAA-MM-JJ : streaks, activité et défi suivent le jour de
 * l'utilisateur, pas UTC (sinon visite de 00h30 = "hier", et deux jours
 * locaux fusionnent en une seule date UTC). */
export function localDayISO(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function localYesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDayISO(d);
}

export type ProgressSnap = {
  xp: number;
  completed: string[];
  scores: Record<string, number>;
  streak: number;
  pieces: number;
};

/** Badges gagnés entre deux snapshots (pour les toasts + confettis). */
export function newBadges(prev: ProgressSnap | null, next: ProgressSnap): Badge[] {
  if (!prev) return [];
  const before = new Set(earnedBadges(prev).map((b) => b.id));
  return earnedBadges(next).filter((b) => !before.has(b.id));
}

/** Objectif quotidien : 50 XP / jour. */
export const DAILY_GOAL = 50;

/** Bonus de régularité ajouté à chaque leçon validée. */
export function streakBonus(streak: number): number {
  if (streak >= 7) return 10;
  if (streak >= 3) return 5;
  return 0;
}

/* ---------- Noms de niveaux ---------- */

const LEVEL_NAMES_FR = [
  "Novice",
  "Apprenti",
  "Élève",
  "Musicien",
  "Harmoniste",
  "Compositeur",
  "Virtuose",
  "Maestro",
  "Légende",
  "Maître Diapason",
];

const LEVEL_NAMES_EN = [
  "Novice",
  "Apprentice",
  "Student",
  "Musician",
  "Harmonist",
  "Composer",
  "Virtuoso",
  "Maestro",
  "Legend",
  "Diapason Master",
];

/** Nom d'apparat du niveau (plafonné au dernier palier). */
export function levelName(lang: Lang, level: number): string {
  const names = lang === "en" ? LEVEL_NAMES_EN : LEVEL_NAMES_FR;
  return names[Math.min(Math.max(1, level), names.length) - 1];
}

/* ---------- Sources d'XP (référence affichée dans /progression) ---------- */

export type XpSource = { key: string; amount: string };

/** Barème officiel des gains d'XP, dans l'ordre d'affichage. */
export const XP_SOURCES: XpSource[] = [
  { key: "xpSrc.lesson", amount: "40 XP" },
  { key: "xpSrc.perfect", amount: "+20 XP" },
  { key: "xpSrc.retry", amount: "+1 / 10 %" },
  { key: "xpSrc.fail", amount: "10 XP" },
  { key: "xpSrc.streak", amount: "+5 / +10 XP" },
  { key: "xpSrc.exam", amount: "50 XP" },
  { key: "xpSrc.games", amount: "×1 – ×4" },
  { key: "xpSrc.ear", amount: "×3 – ×4" },
  { key: "xpSrc.challenge", amount: "= pts" },
  { key: "xpSrc.bass", amount: "30 XP" },
  { key: "xpSrc.drum", amount: "30 XP" },
  { key: "xpSrc.piece", amount: "15 XP" },
];

const BADGE_EN: Record<string, { title: string; desc: string }> = {
  "first-steps": { title: "First steps", desc: "Finish 1 lesson." },
  assidu: { title: "Regular", desc: "3 days in a row." },
  fondations: { title: "Builder", desc: "Finish all 5 Phase-1 lessons." },
  harmoniste: { title: "Harmonist", desc: "Finish 10 lessons." },
  explorateur: { title: "Explorer", desc: "Finish 15 lessons." },
  "sans-faute": { title: "Flawless", desc: "100% somewhere (lesson or ear)." },
  "maitre-modes": { title: "Mode master", desc: "90%+ in the modes lesson." },
  "oreille-or": { title: "Golden ear", desc: "Perfect ear score (8/8)." },
  bassiste: { title: "Bassist", desc: "Pass the bass quiz (≥ 60%)." },
  batteur: { title: "Drummer", desc: "Pass the drum quiz (≥ 60%)." },
  "basse-expert": { title: "Confirmed bassist", desc: "Pass the bassist exam (≥ 60%)." },
  "bat-expert": { title: "Confirmed drummer", desc: "Pass the drummer exam (≥ 60%)." },
  collectionneur: { title: "Collector", desc: "Save 1 piece to the journal." },
  compositeur: { title: "Confirmed composer", desc: "Save 3 pieces to the journal." },
  streak7: { title: "7-day streak", desc: "7 days in a row." },
  xp500: { title: "500 XP", desc: "Earn 500 XP total." },
  virtuose: { title: "Virtuoso", desc: "Earn 1500 XP total." },
  finisher: { title: "Diapason Master", desc: `Finish all ${TOTAL} lessons.` },
};

export function badgeText(lang: Lang, b: Badge): { title: string; desc: string } {
  if (lang === "en") return BADGE_EN[b.id] ?? { title: b.title, desc: b.desc };
  return { title: b.title, desc: b.desc };
}

/** File de révision : débloquées mais fragiles (< 80 %) d'abord, puis prochaine non faite. */
export function reviewQueue(args: {
  order: string[];
  completed: string[];
  scores: Record<string, number>;
  isUnlocked: (id: string) => boolean;
}): { id: string; kind: "weak" | "next" }[] {
  const weak: { id: string; kind: "weak" }[] = [];
  const todo: { id: string; kind: "next" }[] = [];
  for (const id of args.order) {
    if (!args.isUnlocked(id)) continue;
    const sc = args.scores[id];
    if (args.completed.includes(id)) {
      if (sc != null && sc < 80) weak.push({ id, kind: "weak" });
      continue;
    }
    todo.push({ id, kind: "next" });
  }
  return [...weak, ...todo].slice(0, 3);
}

/** 14 derniers jours d'activité pour le graphique (jours locaux). */
export function last14Days(activity: Record<string, number>): { day: string; xp: number }[] {
  const out: { day: string; xp: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = localDayISO(d);
    out.push({ day: iso.slice(5), xp: activity[iso] ?? 0 });
  }
  return out;
}

/** Défi du jour déterministe (seed = date). */
export function dailyChallenge(dateISO?: string): {
  seed: string;
  kind: "intervalles" | "accords" | "manche" | "rythme";
  label: string;
  detail: string;
} {
  const d = dateISO ?? localDayISO();
  let h = 0;
  for (const c of d) h = (h * 31 + c.charCodeAt(0)) % 997;
  const kinds = [
    { kind: "intervalles" as const, label: "Course d'intervalles", detail: "30 s : vise juste sur la 6e corde." },
    { kind: "accords" as const, label: "Constructeur d'accords", detail: "5 triades à construire sur le manche." },
    { kind: "manche" as const, label: "Chasse aux notes", detail: "6 notes à trouver n'importe où." },
    { kind: "rythme" as const, label: "Tempo du jour", detail: "8 temps à 100 bpm, précision maximale." },
  ];
  const pick = kinds[h % kinds.length];
  return { seed: d, ...pick };
}

const CHALLENGE_TXT: Record<string, { fr: [string, string]; en: [string, string] }> = {
  intervalles: {
    fr: ["Course d'intervalles", "30 s : vise juste sur la 6e corde."],
    en: ["Interval race", "30s: hit true on the 6th string."],
  },
  accords: {
    fr: ["Constructeur d'accords", "5 triades à construire sur le manche."],
    en: ["Chord builder", "5 triads to build on the neck."],
  },
  manche: {
    fr: ["Chasse aux notes", "6 notes à trouver n'importe où."],
    en: ["Note hunt", "6 notes to find anywhere."],
  },
  rythme: {
    fr: ["Tempo du jour", "8 temps à 100 bpm, précision maximale."],
    en: ["Tempo of the day", "8 beats at 100 bpm, best accuracy."],
  },
};

/** Libellé du défi dans la langue demandée. */
export function challengeText(lang: Lang, kind: string): [string, string] {
  const e = CHALLENGE_TXT[kind] ?? CHALLENGE_TXT.intervalles;
  return lang === "en" ? e.en : e.fr;
}
