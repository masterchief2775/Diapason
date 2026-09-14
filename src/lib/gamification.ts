export type Badge = {
  id: string;
  title: string;
  desc: string;
  test: (args: { xp: number; streak: number; completed: number; pieces: number; scores: Record<string, number> }) => boolean;
};

export const BADGES: Badge[] = [
  { id: "first-steps", title: "Premiers pas", desc: "Terminer 1 leçon.", test: (a) => a.completed >= 1 },
  { id: "fondations", title: "Bâtisseur", desc: "Terminer les 5 leçons de Phase 1.", test: (a) => a.completed >= 5 },
  { id: "harmoniste", title: "Harmoniste", desc: "Terminer 10 leçons.", test: (a) => a.completed >= 10 },
  { id: "maitre-modes", title: "Maître des modes", desc: "90 %+ à la leçon des modes.", test: (a) => (a.scores["modes"] ?? 0) >= 90 },
  { id: "oreille-or", title: "Oreille d'or", desc: "Score parfait à l'oreille (8/8).", test: (a) => (a.scores["oreille-parfait"] ?? 0) >= 100 },
  { id: "compositeur", title: "Compositeur confirmé", desc: "Enregistrer 3 pièces au carnet.", test: (a) => a.pieces >= 3 },
  { id: "streak7", title: "Série de 7", desc: "7 jours d'affilée.", test: (a) => a.streak >= 7 },
  { id: "xp500", title: "500 XP", desc: "Cumuler 500 XP.", test: (a) => a.xp >= 500 },
  { id: "finisher", title: "Maître Diapason", desc: "Terminer les 18 leçons.", test: (a) => a.completed >= 18 },
];

export function earnedBadges(args: {
  xp: number;
  streak: number;
  completed: number;
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
  if (args.completed >= 18) return "Maître Diapason";
  if (args.completed >= 14) return "Compositeur confirmé";
  if (args.completed >= 10) return "Maître des modes (en devenir)";
  if (args.completed >= 5) return "Harmoniste junior";
  if (args.completed >= 1) return "Apprenti du manche";
  return "Débutant motivé";
}

/** Défi du jour déterministe (seed = date). */
export function dailyChallenge(dateISO?: string): {
  seed: string;
  kind: "intervalles" | "accords" | "manche" | "rythme";
  label: string;
  detail: string;
} {
  const d = dateISO ?? new Date().toISOString().slice(0, 10);
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
