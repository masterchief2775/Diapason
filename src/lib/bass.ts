import { playTone, resumeAudio } from "./audio";

/** 4 cordes Mi – La – Ré – Sol (corde 4 → 1), une octave sous la guitare. */
export const BASS_PC = [4, 9, 2, 7];
export const BASS_MIDI = [28, 33, 38, 43]; // E1 A1 D2 G2

export function bassNoteAt(s: number, f: number): number {
  return (BASS_PC[s] + f) % 12;
}

export function bassFreq(s: number, f: number): number {
  return 440 * Math.pow(2, (BASS_MIDI[s] + f - 69) / 12);
}

export function patternFreq(offset: number, baseMidi = 36): number {
  return 440 * Math.pow(2, (baseMidi + offset - 69) / 12);
}

export async function playBassString(s: number, f = 0, duration = 1.2) {
  const ctx = await resumeAudio();
  playTone(ctx, bassFreq(s, f), ctx.currentTime, duration, 0.5, "basse");
}

export async function playBassPattern(offsets: readonly number[], baseMidi = 36) {
  const ctx = await resumeAudio();
  offsets.forEach((o, i) => {
    playTone(ctx, patternFreq(o, baseMidi), ctx.currentTime + i * 0.5, 0.45, 0.5, "basse");
  });
}

/** Les 4 cordes à vide en arpège descendant (grave → aigu). */
export async function playBassTuning() {
  const ctx = await resumeAudio();
  BASS_PC.forEach((_, s) => {
    playTone(ctx, bassFreq(s, 0), ctx.currentTime + s * 0.45, 1.0, 0.5, "basse");
  });
}

export async function playBassFret(s: number, f: number) {
  const ctx = await resumeAudio();
  playTone(ctx, bassFreq(s, f), ctx.currentTime, 0.5, 0.4, "basse");
}

export type BassPattern = {
  id: string;
  fr: string;
  en: string;
  descFr: string;
  descEn: string;
  offsets: readonly number[];
};

export const BASS_PATTERNS: BassPattern[] = [
  {
    id: "root-fifth",
    fr: "Fondamentale – Quinte",
    en: "Root – Fifth",
    descFr: "Le pain quotidien : la tonique sur les temps, la quinte pour respirer.",
    descEn: "The daily bread: root on the beats, fifth to breathe.",
    offsets: [0, 7, 0, 7],
  },
  {
    id: "octaves",
    fr: "Octaves",
    en: "Octaves",
    descFr: "Disco et funk : la même note, une octave plus haut, en rebond.",
    descEn: "Disco and funk: the same note, one octave up, bouncing back.",
    offsets: [0, 12, 0, 12],
  },
  {
    id: "walking",
    fr: "Walking I – VI – II – V",
    en: "Walking I – VI – II – V",
    descFr: "Jazz : une fondamentale par accord, qui marche vers la suivante.",
    descEn: "Jazz: one root per chord, walking into the next.",
    offsets: [0, 9, 2, 7],
  },
];
