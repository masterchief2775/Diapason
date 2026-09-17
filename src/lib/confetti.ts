/**
 * Confettis légers, sans dépendance (canvas 2D). Couleurs lues dans le thème
 * courant pour rester cohérent (braise, papier, miku…).
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  life: number;
  shape: 0 | 1;
};

let canvas: HTMLCanvasElement | null = null;
let parts: Particle[] = [];
let raf = 0;

function themeColors(): string[] {
  try {
    const cs = getComputedStyle(document.documentElement);
    const get = (k: string, fb: string) => (cs.getPropertyValue(k).trim() || fb);
    return [
      get("--color-gold", "#d4c4a0"),
      get("--color-sage", "#8aa090"),
      get("--color-accent", "#e8d5b5"),
      get("--color-danger", "#c4645f"),
      "#ffffff",
    ];
  } catch {
    return ["#d4c4a0", "#8aa090", "#e8d5b5", "#c4645f", "#ffffff"];
  }
}

function ensureCanvas(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100;";
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function tick() {
  const ctx = canvas?.getContext("2d");
  if (!ctx || !canvas) {
    raf = 0;
    return;
  }
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  parts = parts.filter((p) => p.life > 0);
  for (const p of parts) {
    p.vy += 0.12;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.008;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 0) {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(tick) : 0;
  if (!parts.length && ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

export function burst(opts: { count?: number; x?: number; y?: number; spread?: number } = {}) {
  const ctx = ensureCanvas();
  if (!ctx) return;
  const { count = 70, x = window.innerWidth / 2, y = window.innerHeight * 0.35, spread = 1 } = opts;
  const colors = themeColors();
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (2 + Math.random() * 6) * spread;
    parts.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 3,
      size: 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 0.7 + Math.random() * 0.6,
      shape: Math.random() < 0.7 ? 0 : 1,
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

/** Triple salve pour les grands moments (niveau, badge rare, 100 %). */
export function celebrate() {
  const w = typeof window === "undefined" ? 0 : window.innerWidth;
  const h = typeof window === "undefined" ? 0 : window.innerHeight;
  burst({ count: 90 });
  window.setTimeout(() => burst({ count: 50, x: w * 0.2, y: h * 0.3 }), 180);
  window.setTimeout(() => burst({ count: 50, x: w * 0.8, y: h * 0.3 }), 360);
}
