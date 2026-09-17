import type { ReactNode } from "react";
import { useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { useProgress } from "@/lib/progress";

let bootstrapStarted = false;

/**
 * Bootstrap du store persisté : appelé depuis chaque page (sous la frontière
 * de suspense des routes lazy). Les effets de Page tournent après le commit
 * de la route — donc après son hydratation — ce qui garantit que le premier
 * rendu client voit l'état initial, comme le serveur. Le shell, hydraté plus
 * tôt, ne doit JAMAIS réhydrater (race → mismatch).
 */
function useProgressBootstrap() {
  useEffect(() => {
    if (bootstrapStarted) return;
    bootstrapStarted = true;
    void Promise.resolve(useProgress.persist.rehydrate()).then(() => {
      const s = useProgress.getState();
      s.hydrateStreak();
      applyTheme(s.theme);
    });
  }, []);
}

export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  useProgressBootstrap();
  return (
    <div className={(wide ? "mx-auto max-w-5xl px-4 py-8 pb-16" : "mx-auto max-w-3xl px-4 py-8 pb-16") + " stagger"}>
      {children}
    </div>
  );
}

export function Title({ kicker, children, lead }: { kicker?: string; children: ReactNode; lead?: string }) {
  return (
    <div className="mb-8">
      {kicker && (
        <p className="m-0 flex items-center gap-2 font-mono text-xs tracking-widest text-gold uppercase">
          <span className="inline-block h-px w-6 bg-gold" aria-hidden />
          {kicker}
        </p>
      )}
      <h1 className="mt-2 mb-2 font-display text-3xl font-medium tracking-tight text-balance text-fg md:text-4xl">{children}</h1>
      {lead && <p className="m-0 max-w-xl text-base leading-relaxed text-muted">{lead}</p>}
    </div>
  );
}
