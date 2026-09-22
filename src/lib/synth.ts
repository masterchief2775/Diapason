/**
 * Synthèse instrumentale pure (aucune dépendance, aucun AudioContext).
 * Testable en Node : `node --experimental-strip-types scripts/...`
 */

/**
 * Corde pincée façon guitare acoustique (Karplus-Strong étendu) :
 * - excitation filtrée + peigne de position de médiator (le « twang »),
 * - amortissement calibré sur un T60 dépendant de la hauteur (graves longs),
 * - transitoire d'attaque (bruit de médiator, ~8 ms),
 * - résonance de caisse (2 modes graves qui donnent le « bois »),
 * - saturation douce (compression naturelle d'une vraie table).
 */
export function renderPluckSamples(sampleRate: number, freq: number, seconds: number): Float32Array {
  const len = Math.max(1, Math.floor(sampleRate * seconds));
  const out = new Float32Array(len);
  const N = Math.max(2, Math.round(sampleRate / freq));

  // --- Excitation : bruit passe-bas + peigne de position de médiator ---
  // Pincer à ~20 % de la corde creuse le spectre en peigne : c'est la
  // différence entre un « pling » synthétique et une vraie corde pincée.
  const pickPos = 0.2;
  const pickDelay = Math.max(1, Math.round(N * pickPos));
  const lpCoef = Math.exp((-2 * Math.PI * 5200) / sampleRate); // passe-bas ~5,2 kHz
  const exc = new Float32Array(N);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const noise = Math.random() * 2 - 1;
    lp += (1 - lpCoef) * (noise - lp);
    exc[i] = lp;
  }
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    ring[i] = exc[i] - 0.55 * exc[(i - pickDelay + N) % N];
  }

  // --- Amortissement calibré : T60 (extinction à -60 dB) selon la hauteur ---
  // Les cordes graves vibrent plus longtemps que les aiguës ; le gain de
  // boucle par période vaut g = 10^(-3·N / (T60·sr)).
  const t60 = Math.min(3.4, Math.max(1.1, 3.2 * Math.pow(110 / freq, 0.35)));
  const damp = Math.pow(10, (-3 * N) / (t60 * sampleRate));
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = ring[idx];
    const nxt = ring[(idx + 1) % N];
    ring[idx] = damp * 0.5 * (cur + nxt);
    out[i] = cur;
    idx = (idx + 1) % N;
  }

  // --- Transitoire de médiator : claquement haute-fréquence très bref ---
  // Un vrai pincé commence par un « chik » de 5–10 ms avant la note.
  const atkLen = Math.min(len, Math.floor(sampleRate * 0.008));
  const atkGain = Math.min(0.5, Math.max(0.22, freq / 900));
  let hpPrev = 0;
  for (let i = 0; i < atkLen; i++) {
    const noise = Math.random() * 2 - 1;
    const hp = noise - hpPrev; // passe-haut naïf (dérivée)
    hpPrev = noise;
    const env = Math.exp((-i / sampleRate) * 900);
    out[i] += atkGain * hp * env;
  }

  // --- Caisse de résonance : modes d'air (~98 Hz) et de table (~196 Hz) ---
  // Indépendants de la note : c'est la « voix » en bois de la guitare.
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    out[i] += 0.11 * Math.sin(2 * Math.PI * 98 * t) * Math.exp(-t * 9);
    out[i] += 0.07 * Math.sin(2 * Math.PI * 196 * t + 1.3) * Math.exp(-t * 12);
  }

  // --- Saturation douce + normalisation + fondu anti-clic ---
  const fade = Math.min(len, Math.floor(sampleRate * 0.03));
  let peak = 0;
  for (let i = 0; i < len; i++) {
    const v = Math.tanh(out[i] * 1.15);
    out[i] = v;
    const a = Math.abs(v);
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

/**
 * Basse électrique jouée au doigt : fondamentale dominante, harmoniques
 * sages qui meurent vite, sustain long, attaque « pouce » grave (pas de
 * claquement de médiator) et léger grain (saturation) — le growl discret
 * d'un micro manche. N'utilise PAS Karplus-Strong : à 40 Hz, le peigne de
 * médiator sonnerait faux et la corde filetée ne twangue pas.
 */
export function renderBassSamples(sampleRate: number, freq: number, seconds: number): Float32Array {
  const len = Math.max(1, Math.floor(sampleRate * seconds));
  const out = new Float32Array(len);
  const B = 0.0002; // faible inharmonicité (corde filetée souple)
  const partials = [
    { a: 1.0, d: 0.9 },
    { a: 0.34, d: 1.7 },
    { a: 0.16, d: 2.6 },
    { a: 0.07, d: 3.6 },
    { a: 0.03, d: 5.0 },
  ];
  for (let n = 1; n <= partials.length; n++) {
    const { a, d } = partials[n - 1];
    const f = n * freq * Math.sqrt(1 + B * n * n);
    const omega = (2 * Math.PI * f) / sampleRate;
    const phase = Math.random() * Math.PI * 2;
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      out[i] += a * Math.sin(omega * i + phase) * Math.exp(-t * d);
    }
  }

  // --- Attaque au doigt : « pouf » grave de ~35 ms (bruit passe-bas) ---
  const thumpLen = Math.min(len, Math.floor(sampleRate * 0.035));
  const lpCoef = Math.exp((-2 * Math.PI * 320) / sampleRate); // passe-bas ~320 Hz
  let lp = 0;
  for (let i = 0; i < thumpLen; i++) {
    const noise = Math.random() * 2 - 1;
    lp += (1 - lpCoef) * (noise - lp);
    const env = Math.exp((-i / sampleRate) * 110);
    out[i] += 0.55 * lp * env;
  }

  // --- Grain : saturation un peu plus poussée que la guitare ---
  const attack = Math.min(len, Math.floor(sampleRate * 0.006));
  let peak = 0;
  for (let i = 0; i < len; i++) {
    const v = Math.tanh(out[i] * 1.6);
    out[i] = v;
    const a = Math.abs(v);
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

/** Piano modélisé : 6 partiels légèrement inharmoniques, décroissance par partiel. */
export function renderPianoSamples(sampleRate: number, freq: number, seconds: number): Float32Array {
  const len = Math.max(1, Math.floor(sampleRate * seconds));
  const out = new Float32Array(len);
  const B = 0.00025; // inharmonicité des cordes de piano
  // Le fondamental vit le plus longtemps, les aigus meurent en premier
  // (l'inverse donnait un piano qui s'éclaircit en mourant).
  const partials = [
    { a: 1.0, d: 0.9 },
    { a: 0.48, d: 1.3 },
    { a: 0.24, d: 1.8 },
    { a: 0.12, d: 2.4 },
    { a: 0.06, d: 3.2 },
    { a: 0.03, d: 4.2 },
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
