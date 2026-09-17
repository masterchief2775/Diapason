import { playDrum, resumeAudio, type DrumKind } from "@/lib/audio";
import { PADS } from "@/lib/grooves";
import { useLang } from "@/lib/i18n";

export function hitDrum(kind: DrumKind, peak = 0.5) {
  return resumeAudio().then((ctx) => playDrum(ctx, kind, ctx.currentTime, peak));
}

/** Grille des 8 pads de batterie. */
export function DrumPads() {
  const lang = useLang();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PADS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => void hitDrum(p.id)}
          className="rounded-xl border border-line bg-surface p-5 text-center shadow-sm transition-all hover:border-gold active:scale-95"
        >
          <span className="mx-auto mb-2 block size-3 rounded-full bg-gold/70" aria-hidden />
          <span className="block font-display text-lg leading-tight">{lang === "en" ? p.en : p.fr}</span>
          <span className="font-mono text-[11px] text-subtle">{p.id}</span>
        </button>
      ))}
    </div>
  );
}
