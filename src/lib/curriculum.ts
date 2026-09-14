export type LessonDef = {
  id: string;
  title: string;
  phase: 1 | 2 | 3 | 4;
  kind: "interactive" | "quiz" | "studio";
  summary: string;
  intro: string[];
};

export const PHASES = [
  { id: 1 as const, range: "0 → 20 %", title: "Fondations" },
  { id: 2 as const, range: "20 → 45 %", title: "Harmonie et gammes" },
  { id: 3 as const, range: "45 → 75 %", title: "Maîtrise avancée" },
  { id: 4 as const, range: "75 → 100 %", title: "Composition et expertise" },
];

export const LESSONS: LessonDef[] = [
  {
    id: "notes",
    title: "Notes, octaves, nom des cordes",
    phase: 1,
    kind: "quiz",
    summary: "Les 12 notes et les six cordes à vide.",
    intro: [
      "La musique occidentale découpe l'octave en 12 demi-tons : Do, Do#, Ré, Ré#, Mi, Fa, Fa#, Sol, Sol#, La, La#, Si — puis on recommence une octave plus haut.",
      "Sur une guitare accordée en Mi standard, les cordes à vide (de la plus grave à la plus aiguë) sont Mi, La, Ré, Sol, Si, Mi. Chaque case monte d'un demi-ton.",
    ],
  },
  {
    id: "manche",
    title: "Le manche de la guitare",
    phase: 1,
    kind: "interactive",
    summary: "Repères, cases, et lecture du manche.",
    intro: [
      "Le manche est une grille : corde × case = une note. Les pastilles aux cases 3, 5, 7, 9 et 12 sont des balises visuelles.",
      "La case 12 est l'octave de la corde à vide. Clique les cases pour entendre et nommer chaque note.",
    ],
  },
  {
    id: "intervalles",
    title: "Les intervalles",
    phase: 1,
    kind: "interactive",
    summary: "Distance en demi-tons entre deux notes.",
    intro: [
      "Un intervalle mesure la distance entre deux notes, en demi-tons. Sur une seule corde, chaque case est un demi-ton.",
      "Cette logique construit ensuite les gammes et les accords : une gamme majeure n'est qu'une suite précise d'intervalles.",
    ],
  },
  {
    id: "rythme",
    title: "Rythme de base et lecture rythmique",
    phase: 1,
    kind: "interactive",
    summary: "Valeurs de notes et sens du tempo.",
    intro: [
      "En mesure à 4 temps, la ronde dure 4 temps, la blanche 2, la noire 1, la croche ½.",
      "Avant de jouer des figures, on apprend à coller chaque temps du métronome.",
    ],
  },
  {
    id: "gamme-maj",
    title: "Première gamme majeure et accords",
    phase: 1,
    kind: "interactive",
    summary: "Do majeur, degrés, triades I IV V.",
    intro: [
      "La gamme majeure suit le schéma T–T–½–T–T–T–½ (tons et demi-tons).",
      "En Do : Do Ré Mi Fa Sol La Si. Les accords I, IV et V (Do, Fa, Sol) suffisent déjà à accompagner des centaines de chansons.",
    ],
  },
  {
    id: "accords",
    title: "Construction des accords",
    phase: 2,
    kind: "interactive",
    summary: "Triades majeure, mineure, diminuée, augmentée.",
    intro: [
      "Une triade empile fondamentale, tierce et quinte. Changer la tierce ou la quinte change toute la couleur.",
      "Majeur = 1 3 5, mineur = 1 ♭3 5, diminué = 1 ♭3 ♭5, augmenté = 1 3 ♯5.",
    ],
  },
  {
    id: "gammes",
    title: "Gammes majeures et mineures",
    phase: 2,
    kind: "interactive",
    summary: "Naturelle, harmonique, mélodique.",
    intro: [
      "La mineure naturelle est le mode éolien (relatif de la majeure, 3 demi-tons plus bas).",
      "La mineure harmonique hausse la 7e pour créer une dominante vraie. La mélodique hausse aussi la 6e à la montée.",
    ],
  },
  {
    id: "modes",
    title: "Modes de la gamme majeure",
    phase: 2,
    kind: "interactive",
    summary: "Ionien à locrien, couleur de chaque mode.",
    intro: [
      "Un mode, c'est la même collection de notes, mais une autre tonique. Do ionien et Ré dorien partagent les touches, pas le centre.",
      "Retiens la note caractéristique : lydien = ♯4, mixolydien = ♭7, dorien = 6 majeure, phrygien = ♭2.",
    ],
  },
  {
    id: "pentas",
    title: "Pentatoniques et blues",
    phase: 2,
    kind: "interactive",
    summary: "Cinq notes, blue note, positions.",
    intro: [
      "La pentatonique mineure (1 ♭3 4 5 ♭7) est le terrain de jeu du rock et du blues. Ajoute la ♭5 : tu as la gamme blues.",
      "La pentatonique majeure (1 2 3 5 6) est la même forme, décalée de trois cases — le relatif.",
    ],
  },
  {
    id: "cadences",
    title: "Cadences et progressions",
    phase: 2,
    kind: "interactive",
    summary: "V–I, IV–I, ii–V–I, clichés utiles.",
    intro: [
      "Une cadence conclut une phrase. La cadence parfaite V–I affirme la tonalité. La plagale IV–I est plus douce.",
      "Le ii–V–I est le moteur du jazz. Le I–V–vi–IV est celui de la pop.",
    ],
  },
  {
    id: "harmonie-fonc",
    title: "Harmonie fonctionnelle complète",
    phase: 3,
    kind: "quiz",
    summary: "Tonique, sous-dominante, dominante.",
    intro: [
      "Chaque degré a une fonction : tonique (I, vi, iii) = repos ; sous-dominante (IV, ii) = départ ; dominante (V, vii°) = tension.",
      "Composer, c'est doser tension et résolution. Substituer un accord par un autre de même fonction préserve le discours.",
    ],
  },
  {
    id: "modes-exo",
    title: "Modes et gammes exotiques",
    phase: 3,
    kind: "interactive",
    summary: "Par tons, diminuée, mineure harmonique.",
    intro: [
      "La gamme par tons (6 notes à distance de 1 ton) flotte, sans dominante. Debussy et le fusion l'utilisent pour le rêve ou la tension statique.",
      "La diminuée (alternance ½–1) et la mineure harmonique (seconde augmentée) colorent jazz et metal.",
    ],
  },
  {
    id: "reharmo",
    title: "Substitution et réharmonisation",
    phase: 3,
    kind: "interactive",
    summary: "Triton, relatifs, passage chromatique.",
    intro: [
      "La substitution de triton remplace V7 par un 7 situé un triton plus loin : Sol7 ↔ Ré♭7. Les 3e et 7e s'échangent.",
      "On peut aussi remplacer I par vi, IV par ii, ou glisser chromatiquement vers la cible.",
    ],
  },
  {
    id: "analyse",
    title: "Analyse harmonique de morceaux",
    phase: 3,
    kind: "quiz",
    summary: "Nommer les degrés d'une grille.",
    intro: [
      "Analyser, c'est nommer chaque accord par son degré dans la tonalité, puis voir les cadences et les emprunts.",
      "En Do majeur, Am = vi, F = IV, G = V, C = I. La grille vi–IV–I–V est une rotation du I–V–vi–IV.",
    ],
  },
  {
    id: "melodie",
    title: "Composition mélodique",
    phase: 4,
    kind: "studio",
    summary: "Contour, notes cibles, tension.",
    intro: [
      "Une mélodie forte vise les notes de l'accord sur les temps forts, et utilise les notes de passage ou d'approche ailleurs.",
      "Varie le rythme : une phrase qui ne fait que des noires s'essouffle. Laisse des silences.",
    ],
  },
  {
    id: "structure",
    title: "Structure de chanson",
    phase: 4,
    kind: "quiz",
    summary: "Couplet, refrain, pont, breakdown.",
    intro: [
      "Le couplet raconte, le refrain résume (même paroles, harmonie plus ouverte), le pont contraste (nouveau degré, nouveau mode).",
      "Un schéma classique : intro – couplet – refrain – couplet – refrain – pont – refrain – coda.",
    ],
  },
  {
    id: "genres",
    title: "Composition par genres",
    phase: 4,
    kind: "studio",
    summary: "Codes rock, blues, jazz, metal, pop, funk.",
    intro: [
      "Chaque genre a des progressions, des gammes et un groove. Les connaître, c'est parler la langue avant d'inventer un dialecte.",
      "Choisis un genre, écoute sa grille type, puis compose ta variante dans le studio.",
    ],
  },
  {
    id: "projet",
    title: "Projet final",
    phase: 4,
    kind: "studio",
    summary: "Un morceau complet : grille, mélodie, genre.",
    intro: [
      "Tu rassembles tout : tonalité, progression, mélodie, structure mentale (couplet/refrain), et tu enregistres le résultat dans le carnet.",
      "Le but n'est pas la perfection — c'est de terminer un morceau cohérent que tu peux rejouer et modifier.",
    ],
  },
];

export const LESSON_ORDER = LESSONS.map((l) => l.id);

export function lessonById(id: string) {
  return LESSONS.find((l) => l.id === id);
}

export function lessonsForPhase(phase: number) {
  return LESSONS.filter((l) => l.phase === phase);
}

export type Mcq = { q: string; options: string[]; answer: number; explain: string };

export const QUIZZES: Record<string, Mcq[]> = {
  notes: [
    {
      q: "Combien de notes distinctes dans une octave (tempérament égal) ?",
      options: ["7", "8", "12", "24"],
      answer: 2,
      explain: "12 demi-tons : les 7 notes naturelles plus 5 altérations.",
    },
    {
      q: "La 5e corde à vide (en partant du grave) s'appelle…",
      options: ["Mi", "La", "Ré", "Sol"],
      answer: 1,
      explain: "Cordes à vide : 6 Mi, 5 La, 4 Ré, 3 Sol, 2 Si, 1 Mi.",
    },
    {
      q: "Deux cases sur la même corde, c'est…",
      options: ["un ton", "un demi-ton", "une tierce", "une octave"],
      answer: 1,
      explain: "Chaque case = un demi-ton. Deux cases = un ton.",
    },
    {
      q: "La case 12 d'une corde à vide donne…",
      options: ["la quinte", "la même note une octave au-dessus", "la tierce", "un Si"],
      answer: 1,
      explain: "12 demi-tons = une octave.",
    },
  ],
  "harmonie-fonc": [
    {
      q: "Quelle fonction a le V ?",
      options: ["Tonique", "Sous-dominante", "Dominante", "Pédale"],
      answer: 2,
      explain: "Le V (et le vii°) crée la tension qui veut résoudre sur I.",
    },
    {
      q: "Quel accord peut remplacer le I tout en gardant une fonction tonique ?",
      options: ["V", "IV", "vi", "ii"],
      answer: 2,
      explain: "vi (et iii) partagent assez de notes avec I pour rester toniques.",
    },
    {
      q: "ii et IV sont surtout…",
      options: ["dominants", "sous-dominants", "toniques", "modals"],
      answer: 1,
      explain: "Ils préparent la dominante : départ, pas encore tension maximale.",
    },
    {
      q: "Une cadence parfaite, c'est…",
      options: ["IV–I", "V–I", "ii–IV", "vi–I"],
      answer: 1,
      explain: "V–I, de préférence avec la fondamentale à la basse des deux accords.",
    },
  ],
  analyse: [
    {
      q: "En Sol majeur, Em est le degré…",
      options: ["ii", "iii", "vi", "IV"],
      answer: 2,
      explain: "Sol La Si Do Ré Mi Fa#. Em = vi.",
    },
    {
      q: "Am – F – C – G en Do majeur, c'est…",
      options: ["I–V–vi–IV", "vi–IV–I–V", "ii–V–I–IV", "I–vi–IV–V"],
      answer: 1,
      explain: "Am=vi, F=IV, C=I, G=V.",
    },
    {
      q: "Dans un ii–V–I en Fa, le ii est…",
      options: ["Sol m", "Si♭", "Do7", "Gm"],
      answer: 3,
      explain: "Fa majeur : ii = Sol mineur (Gm).",
    },
    {
      q: "Un accord hors gamme juste avant le V est souvent…",
      options: ["une pédale", "un emprunt / une dominante secondaire", "un cluster", "un mode"],
      answer: 1,
      explain: "V/V (la dominante de la dominante) est l'emprunt le plus courant.",
    },
  ],
  structure: [
    {
      q: "Le refrain se distingue surtout par…",
      options: ["des paroles toujours nouvelles", "un crochet mémorable et une harmonie plus ouverte", "un solo", "le silence"],
      answer: 1,
      explain: "Même texte, pic émotionnel, souvent I plus présent.",
    },
    {
      q: "Le pont sert à…",
      options: ["répéter le couplet", "contraster avant le dernier refrain", "accorder la guitare", "finir le morceau"],
      answer: 1,
      explain: "Nouveau matériau pour relancer l'écoute.",
    },
    {
      q: "Un breakdown, surtout en metal/rock, c'est…",
      options: ["un solo jazz", "une section épurée, souvent plus lourde et rythmique", "un pont vocal", "une intro acoustique"],
      answer: 1,
      explain: "Texture réduite, groove appuyé.",
    },
    {
      q: "Schéma pop le plus courant ?",
      options: ["A–B–C–D sans retour", "couplet–refrain–couplet–refrain–pont–refrain", "12 mesures blues uniquement", "thème et variations baroques"],
      answer: 1,
      explain: "La forme verse/chorus avec bridge reste le standard.",
    },
  ],
};
