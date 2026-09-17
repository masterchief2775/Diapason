import { BASS_PC, bassFreq, bassNoteAt } from "@/lib/bass";
import { MARKER_FRETS, FRET_COUNT } from "@/lib/music";
import { resumeAudio, playTone } from "@/lib/audio";
import { useNN } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ---------- Manche 4 cordes (basse) ---------- */

export function BassNeck({
  highlight,
  onCellClick,
  flash,
  hear = false,
}: {
  highlight?: { rootIndex: number; steps: readonly number[] };
  onCellClick?: (s: number, f: number) => void;
  flash?: { s: number; f: number; ok: boolean } | null;
  hear?: boolean;
}) {
  const nn = useNN();
  const cell = "w-9 h-9 text-[10px]";

  const handle = async (s: number, f: number) => {
    if (hear) {
      const ctx = await resumeAudio();
      playTone(ctx, bassFreq(s, f), ctx.currentTime, 0.45, 0.4);
    }
    onCellClick?.(s, f);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-raised p-3 shadow-sm md:p-5">
      <div className="inline-block min-w-max">
        <div className="ml-14 flex">
          {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => (
            <div key={f} className={cn(cell, "flex items-center justify-center font-mono text-subtle")}>
              {f}
            </div>
          ))}
        </div>
        {BASS_PC.map((pc, sIdx) => (
          <div key={sIdx} className="flex items-center">
            <div className="w-14 shrink-0 font-mono text-xs text-muted">
              {4 - sIdx} · {nn[pc]}
            </div>
            {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => {
              const note = bassNoteAt(sIdx, f);
              const isRoot = highlight && highlight.rootIndex >= 0 && note === highlight.rootIndex;
              const inScale =
                highlight &&
                highlight.steps &&
                highlight.rootIndex >= 0 &&
                highlight.steps.includes((note - highlight.rootIndex + 12) % 12);
              const isFlash = flash && flash.s === sIdx && flash.f === f;
              const show = Boolean(isRoot || inScale || isFlash);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => void handle(sIdx, f)}
                  className={cn(
                    cell,
                    "group/cell relative flex shrink-0 items-center justify-center border-t border-line transition-colors",
                    sIdx === 3 && "border-b",
                    f === 0 ? "border-l-[3px] border-l-gold/60" : "border-l border-line",
                    onCellClick && "hover:bg-raised",
                  )}
                >
                  {MARKER_FRETS.includes(f) && sIdx === 3 && !show && (
                    <span className="absolute -bottom-3 size-1 rounded-full bg-subtle" />
                  )}
                  <span
                    className={cn(
                      "flex size-[calc(100%-8px)] items-center justify-center rounded-full font-mono transition-transform",
                      isRoot && "bg-gold font-semibold text-accent-fg",
                      !isRoot && inScale && "bg-sage text-sage-dim",
                      isFlash && flash.ok && "bg-sage font-semibold text-sage-dim",
                      isFlash && !flash.ok && "bg-danger font-semibold text-danger-dim",
                      !show && "text-transparent group-hover/cell:scale-110",
                    )}
                    style={isRoot ? { boxShadow: "0 0 14px -2px var(--color-gold)" } : undefined}
                  >
                    {show ? nn[note] : ""}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
