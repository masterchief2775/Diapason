import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { resumeAudio, playChordNow } from "@/lib/audio";
import {
  CHORD_QUALITIES,
  INTERVALS,
  degreeChord,
  type ModeKey,
} from "@/lib/music";
import { useLang, useNN, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/memos")({ component: MemosPage });

/** Cycle des quintes : positions 0-11, noms avec bons dièses/bémols. */
const FIFTHS_PC = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
const NAMES_SOLF = ["Do", "Sol", "Ré", "La", "Mi", "Si", "Fa#", "Do#", "La♭", "Mi♭", "Si♭", "Fa"];
const NAMES_ABC = ["C", "G", "D", "A", "E", "B", "F#", "C#", "Ab", "Eb", "Bb", "F"];
const SIGNS = [0, 1, 2, 3, 4, 5, 6, 7, -4, -3, -2, -1]; // +Dièses, −bémols

function MemosPage() {
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const [pos, setPos] = useState(0);
  const names = lang === "en" ? NAMES_ABC : NAMES_SOLF;
  const pc = FIFTHS_PC[pos];
  const majorSteps = [0, 2, 4, 5, 7, 9, 11];
  const scaleNotes = majorSteps.map((s) => nn[(pc + s) % 12]);
  const relative = nn[(pc + 9) % 12];
  const sign = SIGNS[pos];
  const degrees = Array.from({ length: 7 }, (_, i) => degreeChord(pc, "majeure" as ModeKey, i));

  const hearScale = async () => {
    const ctx = await resumeAudio();
    playChordNow(pc, 0, majorSteps.slice(0, 4));
    for (const d of [0, 3, 4]) {
      const ch = degrees[d];
      playChordNow(pc, ch.rootOffset, ch.quality.formula);
      await new Promise((r) => setTimeout(r, 700));
    }
  };

  return (
    <Page wide>
      <Title kicker={t("memo.kicker")} lead={t("memo.lead")}>
        {t("memo.title")}
      </Title>

      <h2 className="mb-1 font-display text-xl">{t("memo.circle")}</h2>
      <p className="mb-4 text-sm text-subtle">{t("memo.circleHint")}</p>
      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div className="gold-halo pointer-events-none absolute inset-8" aria-hidden />
          {FIFTHS_PC.map((_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + 42 * Math.cos(a);
            const y = 50 + 42 * Math.sin(a);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setPos(i)}
                aria-pressed={i === pos}
                className={cn(
                  "absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-xs transition-all",
                  i === pos
                    ? "border-gold bg-gold font-semibold text-accent-fg shadow-lg"
                    : "border-line bg-surface text-muted hover:border-gold hover:text-gold",
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {names[i]}
              </button>
            );
          })}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="m-0 font-display text-3xl text-gold">{names[pos]}</p>
            <p className="m-0 font-mono text-[11px] text-subtle">
              {sign === 0 ? t("memo.none") : sign > 0 ? `${sign} ♯` : `${-sign} ♭`}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-1 font-mono text-[11px] text-subtle">{t("memo.scale")}</p>
          <p className="mt-0 mb-4 font-mono text-sm text-fg">{scaleNotes.join(" · ")}</p>
          <p className="mb-1 font-mono text-[11px] text-subtle">{t("memo.relative")}</p>
          <p className="mt-0 mb-4 font-display text-lg text-gold">{relative}</p>
          <p className="mb-1 font-mono text-[11px] text-subtle">{t("memo.key")}</p>
          <p className="mt-0 mb-4 text-sm text-muted">
            {sign === 0 ? t("memo.none") : sign > 0 ? `${sign} ${t("memo.sharps")}` : `${-sign} ${t("memo.flats")}`}
          </p>
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("memo.degrees")}</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {degrees.map((ch) => (
              <span key={ch.numeral} className="rounded-sm border border-line bg-bg px-2 py-1 font-mono text-xs">
                <span className="text-gold">{ch.numeral}</span> {nn[ch.rootNoteIndex]}
                {ch.quality.suffix}
              </span>
            ))}
          </div>
          <Button variant="outline" onClick={hearScale}>
            {lang === "en" ? "Hear I – IV – V" : "Écouter I – IV – V"}
          </Button>
        </div>
      </div>

      <h2 className="mb-3 font-display text-xl">{t("memo.intervals")}</h2>
      <div className="mb-8 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {INTERVALS.map((iv) => (
          <div key={iv.semis} className="flex items-baseline gap-2 rounded-md border border-line bg-surface px-3 py-2">
            <span className="font-mono text-xs text-gold">{iv.semis} {iv.semis > 1 ? t("memo.semis") : lang === "en" ? "semitone" : "demi-ton"}</span>
            <span className="text-sm capitalize">{lang === "en" ? iv.labelEn : iv.label}</span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-xl">{t("memo.triads")}</h2>
      <div className="mb-8 grid gap-1.5 sm:grid-cols-2">
        {CHORD_QUALITIES.filter((q) => q.formula.length === 3).map((q) => (
          <div key={q.id} className="flex items-baseline gap-2 rounded-md border border-line bg-surface px-3 py-2">
            <span className="text-sm font-medium">{lang === "en" ? q.labelEn : q.label}</span>
            <span className="ml-auto font-mono text-xs text-subtle">{q.degrees}</span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-xl">{t("memo.sevenths")}</h2>
      <div className="mb-8 grid gap-1.5 sm:grid-cols-2">
        {CHORD_QUALITIES.filter((q) => q.formula.length === 4).map((q) => (
          <div key={q.id} className="flex items-baseline gap-2 rounded-md border border-line bg-surface px-3 py-2">
            <span className="text-sm font-medium">
              {lang === "en" ? q.labelEn : q.label} <span className="font-mono text-xs text-gold">{q.suffix || "Δ"}</span>
            </span>
            <span className="ml-auto font-mono text-xs text-subtle">{q.degrees}</span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-xl">{t("memo.cadences")}</h2>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {[
          ["V – I", t("memo.cadPerf")],
          ["IV – I", t("memo.cadPlag")],
          ["V – vi", t("memo.cadBrok")],
          ["ii – V – I", t("memo.cadJazz")],
        ].map(([n, d]) => (
          <div key={n} className="flex items-baseline gap-2 rounded-md border border-line bg-surface px-3 py-2">
            <span className="font-mono text-xs text-gold">{n}</span>
            <span className="text-sm text-muted">{d}</span>
          </div>
        ))}
      </div>
    </Page>
  );
}
