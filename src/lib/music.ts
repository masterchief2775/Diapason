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
    label: "Rock / Hard Rock",
    codes: "Power chords, pentatonique mineure, I–IV–V, riffs en croches, saturation.",
    progression: [0, 3, 4, 3],
    scale: "penta-min" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "blues",
    label: "Blues",
    codes: "12 mesures, I7–IV7–V7, blue notes, shuffle, call & response.",
    progression: [0, 0, 3, 0, 4, 3, 0, 4],
    scale: "blues" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "jazz",
    label: "Jazz / Fusion",
    codes: "ii–V–I, extensions 7/9/13, substitutions triton, swing, voicings drop-2.",
    progression: [1, 4, 0, 0],
    scale: "majeure" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "metal",
    label: "Metal",
    codes: "Mineur harmonique, tritons, cadence andalouse, palm mute, drop-D.",
    progression: [0, 6, 5, 4],
    scale: "harm-min" as ScaleId,
    mode: "mineure" as ModeKey,
  },
  {
    id: "pop",
    label: "Pop / Indie",
    codes: "I–V–vi–IV, mélodie chantable, structure couplet/refrain, arpèges.",
    progression: [0, 4, 5, 3],
    scale: "majeure" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "funk",
    label: "Funk / Soul",
    codes: "Mixolydien, accords 9e, syncopes doubles-croches, groove sur le 1, wah.",
    progression: [0, 0, 3, 4],
    scale: "mixolydian" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "classique",
    label: "Classique / Néo-classique",
    codes: "Mineur harmonique, arpèges sweep, cadences parfaites, contrepoint, i–VI–III–VII.",
    progression: [0, 5, 2, 6],
    scale: "harm-min" as ScaleId,
    mode: "mineure" as ModeKey,
  },
  {
    id: "fingerstyle",
    label: "Fingerstyle moderne",
    codes: "Open tunings, basse alternée + mélodie, DADGAD, tapping percussif, I–V–vi–iii.",
    progression: [0, 4, 5, 2],
    scale: "majeure" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "prog",
    label: "Prog / Math-rock",
    codes: "Métriques impaires (7/8, 5/4), modes lydien/dorien, riffs polymétriques, I–II–vi–IV.",
    progression: [0, 1, 5, 3],
    scale: "lydian" as ScaleId,
    mode: "majeure" as ModeKey,
  },
  {
    id: "bossa",
    label: "Bossa / Latin",
    codes: "maj7/m7, ii–V–I mineur, syncopes bossa, clave, extensions 9/11/13.",
    progression: [1, 4, 0, 5],
    scale: "majeure" as ScaleId,
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

/* ---------- Voicings & inversions (Phase 2) ---------- */

export const INVERSIONS = [
  { id: 0, label: "Fondamentale", short: "Fond.", explain: "La basse joue la fondamentale (1 – 3 – 5)." },
  { id: 1, label: "1er renversement", short: "Inv. 1", explain: "La basse joue la tierce (3 – 5 – 1)." },
  { id: 2, label: "2e renversement", short: "Inv. 2", explain: "La basse joue la quinte (5 – 1 – 3)." },
] as const;

/** Notes d'une triade réordonnées selon le renversement (classes de hauteur relatives). */
export function inversionVoicing(formula: readonly number[], inversion: number): number[] {
  const f = [...formula];
  for (let k = 0; k < inversion; k++) {
    const head = f.shift()!;
    f.push(head + 12);
  }
  return f;
}

export const CAGED = [
  { id: "C", label: "Forme C", frets: "x · 3 · 2 · 0 · 1 · 0", explain: "Base ouverte de Do, barrée ensuite." },
  { id: "A", label: "Forme A", frets: "x · 0 · 2 · 2 · 2 · 0", explain: "La forme barrée la plus courante (ex. Fa en case 1)." },
  { id: "G", label: "Forme G", frets: "3 · 2 · 0 · 0 · 0 · 3", explain: "Grande forme ouverte, utile en arpèges." },
  { id: "E", label: "Forme E", frets: "0 · 2 · 2 · 1 · 0 · 0", explain: "La forme barrée grave (ex. Sol en case 3)." },
  { id: "D", label: "Forme D", frets: "x · x · 0 · 2 · 3 · 2", explain: "Forme aiguë, idéale en trio." },
] as const;

/* ---------- Bibliothèque de progressions analysées ---------- */

export type ProgressionEntry = {
  id: string;
  label: string;
  numerals: string;
  degrees: number[];
  mode: ModeKey;
  genre: string;
  analysis: string;
};

export const PROGRESSION_LIBRARY: ProgressionEntry[] = [
  { id: "pop-axis", label: "Pop axis", numerals: "I–V–vi–IV", degrees: [0, 4, 5, 3], mode: "majeure", genre: "pop", analysis: "Rotation sans tension forte : V→vi évite la résolution, IV relance vers I." },
  { id: "sensitive", label: "Sensitive female", numerals: "vi–IV–I–V", degrees: [5, 3, 0, 4], mode: "majeure", genre: "pop", analysis: "Même boucle, point de départ tonique-substitut (vi). Refrain immédiat." },
  { id: "blues12", label: "Blues 12 mesures", numerals: "I7 – IV7 – V7", degrees: [0, 0, 3, 0, 4, 3, 0, 4], mode: "majeure", genre: "blues", analysis: "Dominantes non-diatoniques partout : friction voulue, blue notes par-dessus." },
  { id: "jazz-251", label: "Anatole jazz", numerals: "ii–V–I", degrees: [1, 4, 0], mode: "majeure", genre: "jazz", analysis: "Sous-dominante → dominante → tonique : la résolution la plus nette du jazz." },
  { id: "andalou", label: "Cadence andalouse", numerals: "i–VII–VI–V", degrees: [0, 6, 5, 4], mode: "mineure", genre: "metal", analysis: "Descente chromatique à la basse, V majeur emprunté à l'harmonique." },
  { id: "soul", label: "Soul 50s", numerals: "I–vi–IV–V", degrees: [0, 5, 3, 4], mode: "majeure", genre: "funk", analysis: "Tonique prolongée (I–vi), puis cadence plagale + parfaite enchaînées." },
  { id: "neoclass", label: "Néo-classique", numerals: "i–VI–III–VII", degrees: [0, 5, 2, 6], mode: "mineure", genre: "classique", analysis: "Cycle de quartes en mineur, arpèges rapides, basse en croches." },
  { id: "bossa-cl", label: "Bossa classique", numerals: "ii7–V7–Imaj7–vi7", degrees: [1, 4, 0, 5], mode: "majeure", genre: "bossa", analysis: "Tétrades + 9e, basse syncopée, résolution douce sur Imaj7." },
  { id: "prog-lyd", label: "Prog lydien", numerals: "I–II–vi–IV", degrees: [0, 1, 5, 3], mode: "majeure", genre: "prog", analysis: "Le II majeur (emprunt lydien, ♯4) donne la couleur rêveuse du prog." },
  { id: "finger-indie", label: "Indie fingerstyle", numerals: "I–V–vi–iii", degrees: [0, 4, 5, 2], mode: "majeure", genre: "fingerstyle", analysis: "Basse alternée + iii qui prolonge la tonique avant de repartir." },
  { id: "hard-rock", label: "Hard rock", numerals: "i–VI–VII (pédale)", degrees: [0, 5, 6], mode: "mineure", genre: "rock", analysis: "Riff sur pédale de tonique, power chords, chœur en VI–VII." },
  { id: "funk-one", label: "Funk sur le 1", numerals: "I7–I7–IV7–V7", degrees: [0, 0, 3, 4], mode: "majeure", genre: "funk", analysis: "Un seul accord longtemps, accent sur le 1, 9e en étendard." },
];

/* ---------- Assistant de composition : suggestions ---------- */

/** Propose les degrés suivants les plus probables selon le dernier accord (logique cadentielle). */
export function suggestNextDegrees(lastDegree: number | undefined, mode: ModeKey): { degree: number; why: string }[] {
  if (lastDegree == null) {
    return [
      { degree: 0, why: "Commencer sur I (ou i) affirme la tonalité." },
      { degree: 5, why: "Commencer sur vi : entrée douce, couleur pop." },
      { degree: 1, why: "Commencer sur ii : annonce un ii–V–I jazz." },
    ];
  }
  const table: Record<number, { degree: number; why: string }[]> = {
    0: [
      { degree: 4, why: "I → V : mise en tension classique." },
      { degree: 5, why: "I → vi : la suite pop la plus chantée." },
      { degree: 3, why: "I → IV : ouverture plagale, refrain." },
    ],
    1: [
      { degree: 4, why: "ii → V : le moteur du ii–V–I." },
      { degree: 6, why: "ii → vii° : montée chromatique vers la tonique." },
    ],
    2: [
      { degree: 5, why: "iii → vi : prolongation tonique douce." },
      { degree: 3, why: "iii → IV : basse montante, effet lift." },
    ],
    3: [
      { degree: 4, why: "IV → V : fanfare vers la dominante." },
      { degree: 0, why: "IV → I : cadence plagale, conclusion douce." },
    ],
    4: [
      { degree: 0, why: "V → I : cadence parfaite, résolution maximale." },
      { degree: 5, why: "V → vi : cadence rompue, surprise pop." },
    ],
    5: [
      { degree: 3, why: "vi → IV : montée émotionnelle du refrain." },
      { degree: 1, why: "vi → ii : cycle de quartes, tournant jazz." },
    ],
    6: [
      { degree: 0, why: "vii° → I : la sensible résout d'un demi-ton." },
      { degree: 4, why: "vii° → V : double tension avant l'explosion." },
    ],
  };
  void mode;
  return table[lastDegree] ?? [{ degree: 0, why: "Revenir à I recentre l'oreille." }];
}

/* ---------- Export MIDI minimal (format 0, 1 piste) ---------- */

function varLen(n: number): number[] {
  let v = n;
  const out = [v & 0x7f];
  v >>= 7;
  while (v) {
    out.unshift(0x80 | (v & 0x7f));
    v >>= 7;
  }
  return out;
}

/** Construit un fichier .mid (Uint8Array) : accords + mélodie, 120 bpm, piano. */
export function buildMidiFile(opts: {
  keyRoot: number;
  mode: ModeKey;
  progression: number[];
  melody: (number | null)[];
}): Uint8Array {
  const { keyRoot, mode, progression, melody } = opts;
  const steps = mode === "majeure" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const tpq = 480;
  const track: number[] = [];
  const pushNote = (tick: number, midi: number, dur: number, vel: number, lastTick: { v: number }) => {
    const deltaOn = tick - lastTick.v;
    track.push(...varLen(deltaOn), 0x90, midi, vel);
    lastTick.v = tick;
    track.push(...varLen(dur), 0x80, midi, 0x40);
    lastTick.v = tick + dur;
  };
  // tempo 120bpm
  track.push(0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20);
  track.push(0x00, 0xc0, 0x00);
  const last = { v: 0 };
  const baseMidi = 48 + keyRoot; // C3..B3 zone
  progression.forEach((d, i) => {
    const tick = i * tpq;
    const ch = DIATONIC[mode];
    const rootOff = ch.steps[d];
    const quality = CHORD_QUALITIES.find((q) => q.id === ch.qualities[d])!;
    quality.formula.forEach((iv) => {
      pushNote(tick, baseMidi + rootOff + iv, Math.floor(tpq * 0.9), 80, last);
    });
    const m = melody[i];
    if (m != null && steps[m] != null) {
      pushNote(tick, baseMidi + steps[m] + 24, Math.floor(tpq * 0.85), 100, last);
    }
  });
  track.push(0x00, 0xff, 0x2f, 0x00);
  const header = [0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, (tpq >> 8) & 0xff, tpq & 0xff];
  const len = track.length;
  const trackHead = [0x4d, 0x54, 0x72, 0x6b, (len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff];
  return new Uint8Array([...header, ...trackHead, ...track]);
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
