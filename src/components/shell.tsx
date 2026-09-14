import { Link, useRouterState } from "@tanstack/react-router";
import { Ear, Guitar, Home, Music2, NotebookPen, Target, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

const NAV = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/manche", label: "Manche", icon: Guitar },
  { to: "/parcours", label: "Parcours", icon: Target },
  { to: "/studio", label: "Studio", icon: Wand2 },
  { to: "/oreille", label: "Oreille", icon: Ear },
  { to: "/jeux", label: "Jeux", icon: Music2 },
  { to: "/carnet", label: "Carnet", icon: NotebookPen },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrateStreak = useProgress((s) => s.hydrateStreak);

  useEffect(() => {
    void useProgress.persist.rehydrate();
    hydrateStreak();
  }, [hydrateStreak]);

  return (
    <div className="min-h-dvh bg-bg pb-24 md:pb-0">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-fg no-underline">
            <span className="flex size-7 items-center justify-center rounded-sm bg-accent text-accent-fg">
              <Music2 size={15} />
            </span>
            <span className="font-display text-lg">Diapason</span>
          </Link>
          <nav className="hidden flex-wrap gap-1 md:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm no-underline",
                    active ? "bg-raised text-gold" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon size={15} /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 backdrop-blur md:hidden">
        <div className="flex justify-around px-1 py-2">
          {NAV.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 text-[10px] no-underline",
                  active ? "text-gold" : "text-muted",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
