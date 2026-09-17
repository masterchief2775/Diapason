import { MARKER_FRETS, FRET_COUNT, noteAt } from "@/lib/music";
import { stringLabels, useNaming, useNN } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { resumeAudio, playTone, getAudioContext } from "@/lib/audio";

export type Highlight = { rootIndex: number; steps: readonly number[] };

const TUNING_OCTAVE = [40, 45, 50, 55, 59, 64];

export function Fretboard({
  highlight,
  onCellClick,
  activeCells = [],
  compact = false,
  hear = false,
}: {
  highlight?: Highlight;
  onCellClick?: (s: number, f: number) => void;
  activeCells?: { s: number; f: number }[];
  compact?: boolean;
  hear?: boolean;
}) {
  const cell = compact ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-[10px]";
  const nn = useNN();
  const labels = stringLabels(useNaming());

  const handle = async (s: number, f: number) => {
    if (hear) {
      const ctx = await resumeAudio();
      playTone(ctx, 440 * Math.pow(2, (TUNING_OCTAVE[s] + f - 69) / 12), ctx.currentTime, 0.45, 0.16);
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
        {labels.map((label, sIdx) => (
          <div key={sIdx} className="flex items-center">
            <div className="w-14 shrink-0 font-mono text-xs text-muted">{label}</div>
            {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => {
              const note = noteAt(sIdx, f);
              const isRoot = highlight && highlight.rootIndex >= 0 && note === highlight.rootIndex;
              const inScale =
                highlight &&
                highlight.steps &&
                highlight.rootIndex >= 0 &&
                highlight.steps.includes((note - highlight.rootIndex + 12) % 12);
              const isActive = activeCells.some((c) => c.s === sIdx && c.f === f);
              const show = Boolean(isRoot || inScale || isActive);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => void handle(sIdx, f)}
                  className={cn(
                    cell,
                    "group/cell relative flex shrink-0 items-center justify-center border-t border-line transition-colors",
                    sIdx === 5 && "border-b",
                    f === 0 ? "border-l-[3px] border-l-gold/60" : "border-l border-line",
                    onCellClick && "hover:bg-raised",
                  )}
                >
                  {MARKER_FRETS.includes(f) && sIdx === 5 && !show && (
                    <span className="absolute -bottom-3 size-1 rounded-full bg-subtle" />
                  )}
                  <span
                    className={cn(
                      "flex size-[calc(100%-8px)] items-center justify-center rounded-full font-mono transition-transform",
                      isRoot && "bg-gold font-semibold text-accent-fg shadow-[0_0_14px_-2px_var(--color-gold)]",
                      !isRoot && inScale && "bg-sage text-sage-dim",
                      isActive && "ring-2 ring-gold ring-offset-1 ring-offset-transparent",
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

export function NoteSymbol({ type, size = 34 }: { type: string; size?: number }) {
  const h = size * 1.3;
  const filled = type === "noire" || type === "croche";
  const hasStem = type !== "ronde";
  const hasFlag = type === "croche";
  const color = "currentColor";
  return (
    <svg width={size} height={h} viewBox="0 0 24 32" aria-hidden>
      <ellipse
        cx="9"
        cy="24"
        rx="7"
        ry="5"
        transform="rotate(-18 9 24)"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="2"
      />
      {hasStem && <line x1="15.5" y1="22" x2="15.5" y2="3" stroke={color} strokeWidth="2" />}
      {hasFlag && <path d="M15.5 3 Q23 6 16 13" fill="none" stroke={color} strokeWidth="2" />}
    </svg>
  );
}

export function playFret(s: number, f: number) {
  const ctx = getAudioContext();
  playTone(ctx, 440 * Math.pow(2, (TUNING_OCTAVE[s] + f - 69) / 12), ctx.currentTime, 0.5);
}
