import { useProgress } from "./progress";
import { freqToMidi, midiToFreq, renderBassSamples, renderPianoSamples, renderPluckSamples } from "./synth";

export type Instrument = "guitare" | "piano";
/** Timbre réel du buffer : la basse a sa synthèse dédiée même en mode guitare. */
export type Timbre = Instrument | "basse";
export { freqToMidi };

let sharedCtx: AudioContext | null = null;
let masterDry: GainNode | null = null;
let reverbIn: ConvolverNode | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new AC();
    setupMaster(sharedCtx);
  }
  return sharedCtx;
}

export async function resumeAudio() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  return ctx;
}

/* ---------- Chaîne master : dry + réverb générée (hors-ligne) ---------- */

function setupMaster(ctx: AudioContext) {
  masterDry = ctx.createGain();
  masterDry.gain.value = 0.9;
  masterDry.connect(ctx.destination);

  reverbIn = ctx.createConvolver();
  reverbIn.buffer = makeImpulse(ctx, 1.6, 2.2);
  const wet = ctx.createGain();
  wet.gain.value = 0.16;
  reverbIn.connect(wet);
  wet.connect(ctx.destination);
}

function makeImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

/* ---------- Synthèse pure (voir synth.ts, testable sans AudioContext) ---------- */

/* ---------- Buffers mis en cache (par instrument + note MIDI) ---------- */

const bufferCache = new Map<string, AudioBuffer>();

function noteBuffer(ctx: AudioContext, timbre: Timbre, freq: number): AudioBuffer {
  const key = `${timbre}:${freqToMidi(freq)}:${ctx.sampleRate}`;
  const hit = bufferCache.get(key);
  if (hit) return hit;
  const midi = freqToMidi(freq);
  const exact = midiToFreq(midi);
  const seconds = timbre === "basse" ? 3.0 : timbre === "guitare" ? 2.5 : 3.5;
  const samples =
    timbre === "basse"
      ? renderBassSamples(ctx.sampleRate, exact, seconds)
      : timbre === "guitare"
        ? renderPluckSamples(ctx.sampleRate, exact, seconds)
        : renderPianoSamples(ctx.sampleRate, exact, seconds);
  const buf = ctx.createBuffer(1, samples.length, ctx.sampleRate);
  buf.getChannelData(0).set(samples);
  bufferCache.set(key, buf);
  // Les retunes microtonales (< 50 cents) passent par playbackRate.
  return buf;
}

function playBuffer(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gainLevel: number,
  timbre?: Timbre,
) {
  const resolved: Timbre = timbre ?? useProgress.getState().instrument;
  const buf = noteBuffer(ctx, resolved, freq);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const exact = midiToFreq(freqToMidi(freq));
  if (Math.abs(exact - freq) > 0.01) src.playbackRate.value = freq / exact;
  const g = ctx.createGain();
  const t = Math.max(startTime, ctx.currentTime);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gainLevel, t + 0.006);
  g.gain.setValueAtTime(gainLevel, t + Math.max(0.006, duration - 0.05));
  g.gain.linearRampToValueAtTime(0, t + duration + 0.08);
  src.connect(g);
  g.connect(masterDry!);
  if (reverbIn) g.connect(reverbIn);
  src.start(t);
  src.stop(t + duration + 0.15);
}

/* ---------- API publique (mêmes signatures qu'avant) ---------- */

export function freqFor(noteIndex: number, octaveShift = 0): number {
  const semitoneFromA4 = noteIndex - 9 + octaveShift * 12;
  return 440 * Math.pow(2, semitoneFromA4 / 12);
}

export function freqForOffset(baseNoteIndex: number, semitoneOffset: number): number {
  return 440 * Math.pow(2, (baseNoteIndex - 9 + semitoneOffset) / 12);
}

/** Joue une note de l'instrument courant (corde pincée ou piano). */
export function playTone(ctx: AudioContext, freq: number, startTime: number, duration = 0.9, gainLevel = 0.5, timbre?: Timbre) {
  playBuffer(ctx, freq, startTime, duration, gainLevel, timbre);
}

/** Métronome : reste un clic franc (un métronome ne sonne pas comme une guitare). */
export function playClick(ctx: AudioContext, time: number, accent = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = accent ? 1400 : 900;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(accent ? 0.2 : 0.11, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.1);
}

export function playIntervalAscending(rootIndex: number, semis: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  playTone(ctx, freqFor(rootIndex), now, 0.7, 0.5);
  const top = rootIndex + semis;
  const octave = top >= 12 ? Math.floor(top / 12) : 0;
  playTone(ctx, freqFor(top % 12, octave), now + 0.85, 0.7, 0.5);
}

/** Accord : en mode guitare, léger arpège (strum) comme un vrai coup de mediator. */
export function playChordNow(keyRoot: number, rootOffset: number, formula: readonly number[], duration = 0.9) {
  const ctx = getAudioContext();
  const instrument = useProgress.getState().instrument;
  const now = ctx.currentTime + 0.02;
  formula.forEach((interval, i) => {
    // Humanisation : aucune main ne frappe les 6 cordes à la milliseconde
    // ni à vélocité égale — ±3 ms et ±10 % rendent le strum vivant.
    const jitter = (Math.random() - 0.5) * 0.006;
    const vel = 0.28 * (1 - i * 0.04) * (0.9 + Math.random() * 0.2);
    const at = instrument === "guitare" ? now + i * 0.022 + jitter : now + jitter * 0.3;
    playTone(ctx, freqForOffset(keyRoot, rootOffset + interval), at, duration, vel);
  });
}

/** Fanfare de victoire : arpège majeur montant (Do–Mi–Sol–Do). */
export function playFanfare(timbre?: Timbre) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime + 0.02;
    [0, 4, 7, 12, 16].forEach((iv, i) => {
      playTone(ctx, freqForOffset(0, iv), now + i * 0.11, 0.7, 0.4, timbre);
    });
  } catch {
    /* audio indisponible — la fête continue sans son */
  }
}

/* ---------- Batterie : modélisation par couches (aucun sample, 100 % hors-ligne) ----------
 * Chaque élément empile 2–3 couches comme un vrai fût : transitoire d'attaque
 * (batte/baguette), corps tonal (peau), et timbre (partiels inharmoniques pour
 * les métaux, comme les 6 partiels du piano modélisé dans synth.ts). */

export type DrumKind =
  | "kick"
  | "snare"
  | "hihat"
  | "openhat"
  | "tom-low"
  | "tom-high"
  | "crash"
  | "ride";

let noiseCache: AudioBuffer | null = null;

function getNoise(ctx: AudioContext): AudioBuffer {
  if (noiseCache && noiseCache.sampleRate === ctx.sampleRate) return noiseCache;
  const len = ctx.sampleRate; // 1 s de bruit blanc
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  noiseCache = buf;
  return buf;
}

function drumBus(ctx: AudioContext, at: number, peak: number, decay: number): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(peak, at + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  g.connect(kitBus(ctx));
  return g;
}

/**
 * Bus du kit : un compresseur colle les couches entre elles (comme une prise
 * de son unique) et empêche l'écrêtage quand grosse caisse + cymbale claquent
 * ensemble. Recréé paresseusement sur le contexte partagé.
 */
let kitBusNode: DynamicsCompressorNode | null = null;

function kitBus(ctx: AudioContext): AudioNode {
  if (ctx === sharedCtx && masterDry) {
    if (!kitBusNode) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 20;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.24;
      comp.connect(masterDry);
      if (reverbIn) comp.connect(reverbIn);
      kitBusNode = comp;
    }
    return kitBusNode;
  }
  // Contexte hors-ligne (rendu de test) : sortie directe.
  return (ctx as AudioContext).destination;
}

/** Couche bruitée filtrée (attaque, timbre, résonance). */
function noiseLayer(
  ctx: AudioContext,
  at: number,
  opts: { type: "highpass" | "bandpass"; freq: number; q?: number; peak: number; decay: number },
) {
  const n = ctx.createBufferSource();
  n.buffer = getNoise(ctx);
  n.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = opts.type;
  f.frequency.value = opts.freq;
  f.Q.value = opts.q ?? 0.9;
  n.connect(f);
  f.connect(drumBus(ctx, at, opts.peak, opts.decay));
  n.start(at);
  n.stop(at + opts.decay + 0.1);
}

/** Couche tonale avec glissando descendant (peau de fût). */
function skinLayer(
  ctx: AudioContext,
  at: number,
  opts: { type: OscillatorType; f0: number; f1: number; slide: number; peak: number; decay: number },
) {
  const o = ctx.createOscillator();
  o.type = opts.type;
  o.frequency.setValueAtTime(opts.f0, at);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.f1), at + opts.slide);
  o.connect(drumBus(ctx, at, opts.peak, opts.decay));
  o.start(at);
  o.stop(at + opts.decay + 0.1);
}

/**
 * Couche métallique : partiels carrés inharmoniques (façon TR-808 : 6 oscillateurs
 * désaccordés) à travers un passe-haut. C'est ce qui distingue un vrai charleston
 * ou une cymbale d'un simple souffle de bruit blanc.
 */
function metalLayer(args: {
  ctx: AudioContext;
  at: number;
  base: number;
  ratios: readonly number[];
  hp: number;
  peak: number;
  decay: number;
}) {
  const { ctx, at } = args;
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = args.hp;
  const bus = drumBus(ctx, at, args.peak, args.decay);
  f.connect(bus);
  const share = 1 / args.ratios.length;
  for (const r of args.ratios) {
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = args.base * r;
    const g = ctx.createGain();
    g.gain.value = share;
    o.connect(g);
    g.connect(f);
    o.start(at);
    o.stop(at + args.decay + 0.1);
  }
}

/** Un coup de batterie à l'instant `at` (secondes, temps AudioContext). */
export function playDrum(ctx: AudioContext, kind: DrumKind, at: number, peak = 0.5) {
  const t = Math.max(at, ctx.currentTime);
  // Normalise l'énergie totale : chaque couche est une fraction du `peak` demandé.
  const k = peak / 0.5;
  switch (kind) {
    case "kick": {
      // Click de batte + corps qui descend vite puis s'installe.
      noiseLayer(ctx, t, { type: "highpass", freq: 2800, peak: 0.18 * k, decay: 0.022 });
      skinLayer(ctx, t, { type: "sine", f0: 155, f1: 47, slide: 0.09, peak: 0.55 * k, decay: 0.5 });
      break;
    }
    case "tom-low":
    case "tom-high": {
      const from = kind === "tom-low" ? 165 : 245;
      // Baguette + peau + harmonique de résonance (×1.5, plus bref).
      noiseLayer(ctx, t, { type: "highpass", freq: 2600, peak: 0.1 * k, decay: 0.018 });
      skinLayer(ctx, t, { type: "sine", f0: from, f1: from * 0.55, slide: 0.14, peak: 0.5 * k, decay: 0.45 });
      skinLayer(ctx, t, { type: "sine", f0: from * 1.5, f1: from * 0.9, slide: 0.1, peak: 0.14 * k, decay: 0.28 });
      break;
    }
    case "snare": {
      // Claque de peau + corps + timbre (passe-bande sifflant, pas de souffle).
      skinLayer(ctx, t, { type: "triangle", f0: 210, f1: 175, slide: 0.06, peak: 0.4 * k, decay: 0.12 });
      noiseLayer(ctx, t, { type: "bandpass", freq: 3200, q: 1, peak: 0.18 * k, decay: 0.035 });
      noiseLayer(ctx, t, { type: "bandpass", freq: 1600, q: 0.8, peak: 0.32 * k, decay: 0.18 });
      noiseLayer(ctx, t, { type: "bandpass", freq: 6500, q: 0.7, peak: 0.26 * k, decay: 0.2 });
      break;
    }
    case "hihat":
    case "openhat": {
      const open = kind === "openhat";
      // Attaque de baguette + cluster métallique 808.
      noiseLayer(ctx, t, { type: "highpass", freq: 7800, peak: 0.2 * k, decay: 0.03 });
      metalLayer({
        ctx, at: t,
        base: 4200,
        ratios: [1, 1.34, 1.67, 2.0, 2.67, 3.01],
        hp: 7500,
        peak: 0.3 * k,
        decay: open ? 0.4 : 0.07,
      });
      break;
    }
    case "crash":
    case "ride": {
      const ride = kind === "ride";
      // Wash de bruit + grappe métallique grave + ping de la cloche (ride).
      noiseLayer(ctx, t, { type: "highpass", freq: 5000, peak: 0.22 * k, decay: ride ? 0.7 : 1.1 });
      metalLayer({
        ctx, at: t,
        base: ride ? 3400 : 2900,
        ratios: [1, 1.19, 1.56, 2.01, 2.66, 3.36],
        hp: 4800,
        peak: 0.26 * k,
        decay: ride ? 0.9 : 1.4,
      });
      if (ride) skinLayer(ctx, t, { type: "square", f0: 5200, f1: 5100, slide: 0.05, peak: 0.08 * k, decay: 0.09 });
      break;
    }
  }
}
