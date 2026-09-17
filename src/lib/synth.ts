/**
 * Synthèse instrumentale pure (aucune dépendance, aucun AudioContext).
 * Testable en Node : `node --experimental-strip-types scripts/...`
 */

/** Corde pincée (Karplus-Strong) : attaque bruitée + amortissement passe-bas. */
export function renderPluckSamples(sampleRate: number, freq: number, seconds: number): Float32Array {
  const len = Math.max(1, Math.floor(sampleRate * seconds));
  const out = new Float32Array(len);
  const N = Math.max(2, Math.round(sampleRate / freq));
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
  // Les cordes graves vibrent plus longtemps que les aiguës.
  const damp = freq < 200 ? 0.9975 : freq < 400 ? 0.9965 : 0.995;
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = ring[idx];
    const nxt = ring[(idx + 1) % N];
    ring[idx] = damp * 0.5 * (cur + nxt);
    out[i] = cur;
    idx = (idx + 1) % N;
  }
  // Fondu de sortie anti-clic + normalisation douce.
  const fade = Math.min(len, Math.floor(sampleRate * 0.03));
  let peak = 0;
  for (let i = 0; i < len; i++) {
    const a = Math.abs(out[i]);
    if (a > peak) peak = a;
  }
  const norm = peak > 0 ? 0.9 / peak : 1;
  for (let i = 0; i < len; i++) {
    let v = out[i] * norm;
    if (i > len - fade) v *= (len - i) / fade;
    out[i] = v;
  }
  return out;
}

/** Piano modélisé : 6 partiels légèrement inharmoniques, décroissance par partiel. */
export function renderPianoSamples(sampleRate: number, freq: number, seconds: number): Float32Array {
  const len = Math.max(1, Math.floor(sampleRate * seconds));
  const out = new Float32Array(len);
  const B = 0.00025; // inharmonicité des cordes de piano
  const partials = [
    { a: 1.0, d: 3.2 },
    { a: 0.48, d: 2.4 },
    { a: 0.24, d: 1.8 },
    { a: 0.12, d: 1.3 },
    { a: 0.06, d: 0.9 },
    { a: 0.03, d: 0.6 },
  ];
  for (let n = 1; n <= partials.length; n++) {
    const { a, d } = partials[n - 1];
    const f = n * freq * Math.sqrt(1 + B * n * n);
    const omega = (2 * Math.PI * f) / sampleRate;
    // Phase aléatoire : évite les annulations trop régulières.
    const phase = Math.random() * Math.PI * 2;
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      out[i] += a * Math.sin(omega * i + phase) * Math.exp(-t * d);
    }
  }
  const attack = Math.min(len, Math.floor(sampleRate * 0.004));
  let peak = 0;
  for (let i = 0; i < len; i++) {
    const a = Math.abs(out[i]);
    if (a > peak) peak = a;
  }
  const norm = peak > 0 ? 0.85 / peak : 1;
  for (let i = 0; i < len; i++) {
    let v = out[i] * norm;
    if (i < attack) v *= i / attack;
    out[i] = v;
  }
  return out;
}

export function freqToMidi(freq: number): number {
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
