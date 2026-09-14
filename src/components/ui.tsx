import type { ButtonHTMLAttributes, ReactNode } from "react";
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
        "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-accent-fg hover:bg-gold",
        variant === "ghost" && "bg-transparent text-muted hover:text-fg",
        variant === "outline" && "border border-line bg-transparent text-gold hover:bg-raised",
        variant === "danger" && "bg-danger-dim text-danger",
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
    <div className={cn("rounded-lg border border-line bg-surface p-5", className)}>{children}</div>
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
        "rounded-sm border px-2.5 py-1.5 font-mono text-xs transition-colors",
        tone === "gold" &&
          (on ? "border-gold bg-raised text-gold" : "border-line bg-surface text-muted"),
        tone === "sage" &&
          (on ? "border-sage bg-sage-dim text-sage" : "border-line bg-surface text-muted"),
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
      className="mb-5 inline-flex items-center gap-1.5 p-0 text-sm text-muted hover:text-fg"
    >
      ← {label}
    </button>
  );
}
