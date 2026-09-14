import type { ReactNode } from "react";

export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "mx-auto max-w-5xl px-4 py-8 pb-16" : "mx-auto max-w-3xl px-4 py-8 pb-16"}>
      {children}
    </div>
  );
}

export function Title({ kicker, children, lead }: { kicker?: string; children: ReactNode; lead?: string }) {
  return (
    <div className="mb-8">
      {kicker && <p className="m-0 font-mono text-xs tracking-widest text-gold uppercase">{kicker}</p>}
      <h1 className="mt-1 mb-2 font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">{children}</h1>
      {lead && <p className="m-0 max-w-xl text-base leading-relaxed text-muted">{lead}</p>}
    </div>
  );
}
