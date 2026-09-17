/**
 * Détection de hauteur par autocorrélation (temps réel, micro).
 * Pur et testable en Node (zéro dépendance).
 */

const NAMES = ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

export type DetectedNote = {
  freq: number;
  midi: number;
  name: string;
  cents: number; // écart au demi-ton le plus proche (-50..+50)
  clarity: number; // 0..1, fiabilité
};

/** Autocorrélation normalisée + interpolation parabolique. */
export function detectPitch(buf: Float32Array, sampleRate: number): { freq: number; clarity: number } | null {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.008) return null; // silence / bruit de fond

  // Retire le continu.
  let mean = 0;
  for (let i = 0; i < n; i++) mean += buf[i];
  mean /= n;

  const minF = 55; // en dessous du Mi grave (82 Hz), on coupe
  const maxF = 1200;
  const minLag = Math.floor(sampleRate / maxF);
  const maxLag = Math.min(n - 2, Math.ceil(sampleRate / minF));

  let bestLag = -1;
  let bestCorr = 0;
  // Corrélation normalisée par l'énergie à lag 0.
  let energy = 0;
  for (let i = 0; i < n; i++) {
    const v = buf[i] - mean;
    energy += v * v;
  }
  if (energy <= 0) return null;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) {
      s += (buf[i] - mean) * (buf[i + lag] - mean);
    }
    const corr = s / energy;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }
  if (bestLag < 0 || bestCorr < 0.6) return null;

  // Interpolation parabolique autour du pic.
  const lag = bestLag;
  const y0 = corrAt(buf, mean, energy, n, lag - 1);
  const y1 = bestCorr;
  const y2 = corrAt(buf, mean, energy, n, lag + 1);
  const denom = y0 - 2 * y1 + y2;
  const shift = denom !== 0 ? (0.5 * (y0 - y2)) / denom : 0;
  const period = lag + Math.max(-1, Math.min(1, shift));
  const freq = sampleRate / period;

  // Pénalise les octaves fantômes : préfère le lag fondamental si proche.
  return { freq, clarity: Math.min(1, bestCorr) };
}

function corrAt(buf: Float32Array, mean: number, energy: number, n: number, lag: number): number {
  if (lag < 1 || lag >= n) return 0;
  let s = 0;
  for (let i = 0; i + lag < n; i++) s += (buf[i] - mean) * (buf[i + lag] - mean);
  return s / energy;
}

export function freqToDetected(freq: number, clarity: number): DetectedNote {
  const midiFloat = 69 + 12 * Math.log2(freq / 440);
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);
  const name = NAMES[((midi % 12) + 12) % 12];
  return { freq, midi, name, cents, clarity };
}

/** Génère un signal de test (fondamental + harmoniques, comme une corde). */
export function synthTestTone(sampleRate: number, freq: number, seconds: number): Float32Array {
  const len = Math.floor(sampleRate * seconds);
  const out = new Float32Array(len);
  const partials = [1, 0.4, 0.2, 0.1];
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    let v = 0;
    partials.forEach((a, k) => {
      v += a * Math.sin(2 * Math.PI * freq * (k + 1) * t);
    });
    out[i] = 0.5 * v * Math.exp(-t * 1.5);
  }
  return out;
}
