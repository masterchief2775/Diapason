import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-accent-fg shadow-sm hover:brightness-105",
        variant === "ghost" && "bg-transparent text-muted hover:text-fg",
        variant === "outline" && "border border-line bg-transparent text-gold hover:border-gold hover:bg-raised",
        variant === "danger" && "bg-danger-dim text-danger hover:brightness-110",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("panel-sheen rounded-xl border border-line bg-surface p-5 shadow-sm", className)}>{children}</div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 font-mono text-xs tracking-widest text-gold uppercase">{children}</p>
  );
}

export function Chip({
  active,
  tone = "gold",
  onClick,
  children,
}: {
  active?: boolean;
  tone?: "gold" | "sage";
  onClick?: () => void;
  children: ReactNode;
}) {
  const on = active;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1.5 font-mono text-xs transition-all active:scale-[0.97]",
        tone === "gold" &&
          (on ? "border-gold bg-raised text-gold shadow-sm" : "border-line bg-surface text-muted hover:border-gold/60 hover:text-fg"),
        tone === "sage" &&
          (on ? "border-sage bg-sage-dim text-sage shadow-sm" : "border-line bg-surface text-muted hover:border-sage/60 hover:text-fg"),
      )}
    >
      {children}
    </button>
  );
}

export function BackLink({ onClick, label = "Tableau de bord" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 inline-flex items-center gap-1.5 rounded-sm p-0 text-sm text-muted transition-colors hover:text-gold"
    >
      <ArrowLeft size={15} /> {label}
    </button>
  );
}

/** État vide illustré (carnet, galerie, journal). */
export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-sheen relative overflow-hidden rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center">
      <div className="gold-halo pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2" aria-hidden />
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full border border-line bg-raised text-gold">
        {icon}
      </div>
      <p className="m-0 font-display text-lg">{title}</p>
      <p className="mx-auto mt-1 mb-0 max-w-sm text-sm leading-relaxed text-muted">{hint}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Anneau de score animé (récapitulatifs). */
export function ScoreRing({ percent, size = 120 }: { percent: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const good = percent >= 80;
  const mid = percent >= 60;
  const color = good ? "var(--color-sage)" : mid ? "var(--color-gold)" : "var(--color-danger)";
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${percent} %`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth="9" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(100, percent)) / 100)}
          style={{ transition: "stroke-dashoffset 0.9s var(--ease-out)" }}
        />
      </svg>
      <span className="absolute font-display text-2xl">{percent}<span className="text-sm text-subtle"> %</span></span>
    </div>
  );
}
