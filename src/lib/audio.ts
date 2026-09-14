let sharedCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new AC();
  }
  return sharedCtx;
}

export async function resumeAudio() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  return ctx;
}

export function freqFor(noteIndex: number, octaveShift = 0): number {
  const semitoneFromA4 = noteIndex - 9 + octaveShift * 12;
  return 440 * Math.pow(2, semitoneFromA4 / 12);
}

export function freqForOffset(baseNoteIndex: number, semitoneOffset: number): number {
  return 440 * Math.pow(2, (baseNoteIndex - 9 + semitoneOffset) / 12);
}

export function playTone(ctx: AudioContext, freq: number, startTime: number, duration = 0.9, gainLevel = 0.18) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export function playClick(ctx: AudioContext, time: number, accent = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = accent ? 1400 : 900;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(accent ? 0.22 : 0.12, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.1);
}

export function playIntervalAscending(rootIndex: number, semis: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  playTone(ctx, freqFor(rootIndex), now, 0.7);
  const top = rootIndex + semis;
  const octave = top >= 12 ? Math.floor(top / 12) : 0;
  playTone(ctx, freqFor(top % 12, octave), now + 0.85, 0.7);
}

export function playChordNow(keyRoot: number, rootOffset: number, formula: readonly number[], duration = 0.9) {
  const ctx = getAudioContext();
  const now = ctx.currentTime + 0.02;
  formula.forEach((interval, i) => {
    playTone(ctx, freqForOffset(keyRoot, rootOffset + interval), now, duration, 0.12 - i * 0.015);
  });
}
