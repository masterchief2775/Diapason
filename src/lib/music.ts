export const NOTES = [
  "Do",
  "Do#",
  "Ré",
  "Ré#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
] as const;

export type NoteName = (typeof NOTES)[number];

/** Cordes 6 → 1 (Mi grave → Mi aigu), classes de hauteur */
export const TUNING = [4, 9, 2, 7, 11, 4] as const;
export const STRING_LABELS = ["6 · Mi", "5 · La", "4 · Ré", "3 · Sol", "2 · Si", "1 · Mi"];
export const FRET_COUNT = 12;
export const MARKER_FRETS = [3, 5, 7, 9];

export function noteAt(stringIndex: number, fret: number): number {
  return (TUNING[stringIndex] + fret) % 12;
}

export function wrapPitch(n: number): number {
  return ((n % 12) + 12) % 12;
}

export const SCALES = [
  { id: "majeure", label: "Majeure", steps: [0, 2, 4, 5, 7, 9, 11] },
  { id: "mineure", label: "Mineure naturelle", steps: [0, 2, 3, 5, 7, 8, 10] },
  { id: "harm-min", label: "Mineure harmonique", steps: [0, 2, 3, 5, 7, 8, 11] },
  { id: "mel-min", label: "Mineure mélodique", steps: [0, 2, 3, 5, 7, 9, 11] },
  { id: "penta-maj", label: "Pentatonique majeure", steps: [0, 2, 4, 7, 9] },
  { id: "penta-min", label: "Pentatonique mineure", steps: [0, 3, 5, 7, 10] },
  { id: "blues", label: "Blues", steps: [0, 3, 5, 6, 7, 10] },
  { id: "dorian", label: "Dorien", steps: [0, 2, 3, 5, 7, 9, 10] },
  { id: "phrygian", label: "Phrygien", steps: [0, 1, 3, 5, 7, 8, 10] },
  { id: "lydian", label: "Lydien", steps: [0, 2, 4, 6, 7, 9, 11] },
  { id: "mixolydian", label: "Mixolydien", steps: [0, 2, 4, 5, 7, 9, 10] },
  { id: "locrian", label: "Locrien", steps: [0, 1, 3, 5, 6, 8, 10] },
  { id: "whole", label: "Par tons", steps: [0, 2, 4, 6, 8, 10] },
  { id: "hw-dim", label: "Diminuée (D-C)", steps: [0, 1, 3, 4, 6, 7, 9, 10] },
] as const;

export type ScaleId = (typeof SCALES)[number]["id"];

export const INTERVALS = [
  { semis: 1, label: "seconde mineure" },
  { semis: 2, label: "seconde majeure" },
  { semis: 3, label: "tierce mineure" },
  { semis: 4, label: "tierce majeure" },
  { semis: 5, label: "quarte juste" },
  { semis: 6, label: "triton" },
  { semis: 7, label: "quinte juste" },
  { semis: 8, label: "sixte mineure" },
  { semis: 9, label: "sixte majeure" },
  { semis: 10, label: "septième mineure" },
  { semis: 11, label: "septième majeure" },
  { semis: 12, label: "octave" },
] as const;

export const CHORD_QUALITIES = [
  { id: "maj", label: "Majeur", formula: [0, 4, 7], degrees: "1 – 3 – 5", suffix: "" },
  { id: "min", label: "Mineur", formula: [0, 3, 7], degrees: "1 – ♭3 – 5", suffix: "m" },
  { id: "dim", label: "Diminué", formula: [0, 3, 6], degrees: "1 – ♭3 – ♭5", suffix: "°" },
  { id: "aug", label: "Augmenté", formula: [0, 4, 8], degrees: "1 – 3 – ♯5", suffix: "+" },
  { id: "maj7", label: "Majeur 7", formula: [0, 4, 7, 11], degrees: "1 – 3 – 5 – 7", suffix: "Δ" },
  { id: "min7", label: "Mineur 7", formula: [0, 3, 7, 10], degrees: "1 – ♭3 – 5 – ♭7", suffix: "m7" },
  { id: "dom7", label: "Dominante 7", formula: [0, 4, 7, 10], degrees: "1 – 3 – 5 – ♭7", suffix: "7" },
  { id: "m7b5", label: "Demi-diminué", formula: [0, 3, 6, 10], degrees: "1 – ♭3 – ♭5 – ♭7", suffix: "ø" },
] as const;

export type ChordQualityId = (typeof CHORD_QUALITIES)[number]["id"];

export const DIATONIC = {
  majeure: {
    steps: [0, 2, 4, 5, 7, 9, 11],
    qualities: ["maj", "min", "min", "maj", "maj", "min", "dim"] as ChordQualityId[],
    numerals: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
    functions: ["Tonique", "Sous-dominante", "Tonique", "Sous-dominante", "Dominante", "Tonique", "Dominante"],
  },
  mineure: {
    steps: [0, 2, 3, 5, 7, 8, 10],
    qualities: ["min", "dim", "maj", "min", "min", "maj", "maj"] as ChordQualityId[],
    numerals: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
    functions: ["Tonique", "Sous-dominante", "Tonique", "Sous-dominante", "Dominante", "Sous-dominante", "Dominante"],
  },
} as const;

export type ModeKey = keyof typeof DIATONIC;

export function qualityById(id: ChordQualityId) {
  const q = CHORD_QUALITIES.find((c) => c.id === id);
  if (!q) throw new Error(`Unknown quality ${id}`);
  return q;
}

export function degreeChord(keyRoot: number, mode: ModeKey, degreeIdx: number) {
  const d = DIATONIC[mode];
  const rootOffset = d.steps[degreeIdx];
  const rootNoteIndex = wrapPitch(keyRoot + rootOffset);
  const quality = qualityById(d.qualities[degreeIdx]);
  return {
    rootOffset,
    rootNoteIndex,
    quality,
    numeral: d.numerals[degreeIdx],
    function: d.functions[degreeIdx],
  };
}

export function chordLabel(rootNoteIndex: number, qualityId: ChordQualityId): string {
  return `${NOTES[rootNoteIndex]}${qualityById(qualityId).suffix}`;
}

export const PROGRESSION_PRESETS: { label: string; degrees: number[]; mode?: ModeKey; genre?: string }[] = [
  { label: "Pop · I–V–vi–IV", degrees: [0, 4, 5, 3], genre: "pop" },
  { label: "Blues/rock · I–IV–V–IV", degrees: [0, 3, 4, 3], genre: "rock" },
  { label: "Cadence jazz · ii–V–I", degrees: [1, 4, 0], genre: "jazz" },
  { label: "Andalou · i–VII–VI–V", degrees: [0, 6, 5, 4], mode: "mineure", genre: "metal" },
  { label: "Soul · I–vi–IV–V", degrees: [0, 5, 3, 4], genre: "funk" },
  { label: "Folk · I–V–vi–iii–IV", degrees: [0, 4, 5, 2, 3], genre: "pop" },
];

export const GENRES = [
  {
    id: "rock",
    label: "Rock",
    codes: "Power chords, pentatonique mineure, I–IV–V, riffs en croches.",
    progression: [0, 3, 4, 3],
    scale: "penta-min" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "blues",
    label: "Blues",
    codes: "12 mesures, I7–IV7–V7, blue notes, shuffle.",
    progression: [0, 0, 3, 0, 4, 3, 0, 4],
    scale: "blues" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "jazz",
    label: "Jazz",
    codes: "ii–V–I, extensions 7/9, substitutions, swing.",
    progression: [1, 4, 0, 0],
    scale: "majeure" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "metal",
    label: "Metal",
    codes: "Mineur harmonique, tritons, palais andalou, palm mute.",
    progression: [0, 6, 5, 4],
    scale: "harm-min" as ScaleId,
    mode: "mineure" as ModeKey,
  },
  {
    id: "pop",
    label: "Pop",
    codes: "I–V–vi–IV, mélodie chantable, structure couplet/refrain.",
    progression: [0, 4, 5, 3],
    scale: "majeure" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "funk",
    label: "Funk",
    codes: "Mixolydien, 9e, syncopes 16e, groove sur le 1.",
    progression: [0, 0, 3, 4],
    scale: "mixolydian" as ScaleId,
    mode: "majeure" as ModeKey,
  },
] as const;

export const NOTE_VALUES = [
  { id: "ronde", label: "Ronde", beats: 4 },
  { id: "blanche", label: "Blanche", beats: 2 },
  { id: "noire", label: "Noire", beats: 1 },
  { id: "croche", label: "Croche", beats: 0.5 },
] as const;

export const MODES_MAJOR = [
  { degree: 0, name: "Ionien", color: "Majeur lumineux, stable." },
  { degree: 1, name: "Dorien", color: "Mineur jazzy, sixte majeure." },
  { degree: 2, name: "Phrygien", color: "Mineur sombre, seconde mineure." },
  { degree: 3, name: "Lydien", color: "Majeur rêveur, quarte augmentée." },
  { degree: 4, name: "Mixolydien", color: "Majeur bluesy, septième mineure." },
  { degree: 5, name: "Éolien", color: "Mineur naturel, nostalgique." },
  { degree: 6, name: "Locrien", color: "Instable, quinte diminuée." },
] as const;

export function scaleFromId(id: ScaleId) {
  return SCALES.find((s) => s.id === id)!;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
