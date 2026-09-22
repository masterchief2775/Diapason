import type { DrumKind } from "./audio";
import { playDrum, resumeAudio } from "./audio";

export const PADS: { id: DrumKind; fr: string; en: string }[] = [
  { id: "kick", fr: "Grosse caisse", en: "Kick" },
  { id: "snare", fr: "Caisse claire", en: "Snare" },
  { id: "hihat", fr: "Charleston fermé", en: "Closed hi-hat" },
  { id: "openhat", fr: "Charleston ouvert", en: "Open hi-hat" },
  { id: "tom-low", fr: "Tom grave", en: "Low tom" },
  { id: "tom-high", fr: "Tom aigu", en: "High tom" },
  { id: "crash", fr: "Crash", en: "Crash" },
  { id: "ride", fr: "Ride", en: "Ride" },
];

export type Groove = {
  id: string;
  fr: string;
  en: string;
  descFr: string;
  descEn: string;
  steps: DrumKind[][];
};

function build(set: Record<number, DrumKind[]>): DrumKind[][] {
  return Array.from({ length: 16 }, (_, i) => set[i] ?? []);
}

function hat8(extra: Record<number, DrumKind[]> = {}): Record<number, DrumKind[]> {
  const out: Record<number, DrumKind[]> = { ...extra };
  for (let i = 0; i < 16; i += 2) out[i] = [...(out[i] ?? []), "hihat"];
  return out;
}

export const GROOVES: Groove[] = [
  {
    id: "rock",
    fr: "Rock",
    en: "Rock",
    descFr: "Grosse caisse aux temps 1 et 3, claire aux 2 et 4.",
    descEn: "Kick on 1 and 3, snare on 2 and 4.",
    steps: build(hat8({ 0: ["kick"], 4: ["snare"], 8: ["kick"], 12: ["snare"] })),
  },
  {
    id: "punk",
    fr: "Punk",
    en: "Punk",
    descFr: "La grosse caisse martèle tous les temps.",
    descEn: "The kick hammers every beat.",
    steps: build(hat8({ 0: ["kick"], 4: ["kick", "snare"], 8: ["kick"], 12: ["kick", "snare"] })),
  },
  {
    id: "funk",
    fr: "Funk",
    en: "Funk",
    descFr: "Charleston en doubles-croches, grosse caisse syncopée.",
    descEn: "Sixteenth-note hi-hat, syncopated kick.",
    steps: build({
      ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, ["hihat" as DrumKind]])),
      0: ["hihat", "kick"], 4: ["hihat", "snare"], 7: ["hihat", "kick"],
      10: ["hihat", "kick"], 12: ["hihat", "snare"], 15: ["hihat", "snare"],
    }),
  },
  {
    id: "bossa",
    fr: "Bossa-nova",
    en: "Bossa-nova",
    descFr: "Grosse caisse décalée, charleston ouvert qui respire.",
    descEn: "Off-beat kick, breathing open hi-hat.",
    steps: (() => {
      // hat8 ajoute un charleston fermé sur tous les pas pairs — sauf le 14
      // qui porte déjà le charleston OUVERT (les deux ensemble = impossible).
      const s = hat8({ 0: ["kick"], 4: ["snare"], 6: ["kick"], 8: ["kick"], 12: ["snare"], 14: ["openhat"] });
      s[14] = ["openhat"];
      return build(s);
    })(),
  },
];

/** Nombre de mesures jouées à chaque écoute. */
export const GROOVE_BARS = 2;

/** Break de démonstration : caisse claire ×2, toms, crash. */
export async function playDemoFill() {
  const ctx = await resumeAudio();
  const seq: [number, DrumKind][] = [
    [0, "snare"], [0.25, "snare"], [0.5, "tom-low"], [0.75, "tom-high"], [1.0, "crash"],
  ];
  for (const [dt, kind] of seq) playDrum(ctx, kind, ctx.currentTime + dt, 0.5);
}

/** Joue un rythme (2 mesures) au tempo donné. */
export async function playGroove(groove: Groove, bpm: number, peak = 0.5) {
  const ctx = await resumeAudio();
  const stepDur = 60 / bpm / 4;
  const t0 = ctx.currentTime + 0.06;
  for (let bar = 0; bar < GROOVE_BARS; bar++) {
    for (let s = 0; s < 16; s++) {
      const at = t0 + (bar * 16 + s) * stepDur;
      for (const k of groove.steps[s]) playDrum(ctx, k, at, peak);
    }
  }
  return { stepDur, bars: GROOVE_BARS };
}
