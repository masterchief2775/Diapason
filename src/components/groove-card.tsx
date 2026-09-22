import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui";
import { GROOVE_BARS, playGroove, type Groove } from "@/lib/grooves";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Carte rythme : lecture 2 mesures + pas lumineux. */
export function GrooveCard({ groove, bpm }: { groove: Groove; bpm: number }) {
  const lang = useLang();
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    timers.current.forEach((tm) => window.clearTimeout(tm));
  }, []);

  const play = async () => {
    if (playing) return;
    // Réinitialise la file : une relecture enchaînée ne doit pas rejouer
    // les surbrillances de la précédente.
    timers.current.forEach((tm) => window.clearTimeout(tm));
    timers.current = [];
    const { stepDur } = await playGroove(groove, bpm);
    for (let bar = 0; bar < GROOVE_BARS; bar++) {
      for (let s = 0; s < 16; s++) {
        const idx = bar * 16 + s;
        timers.current.push(window.setTimeout(() => setLit(s), idx * stepDur * 1000));
      }
    }
    setPlaying(true);
    timers.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        setLit(null);
      }, GROOVE_BARS * 16 * stepDur * 1000 + 60),
    );
  };

  return (
    <div className="panel-sheen rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 font-display text-lg">{lang === "en" ? groove.en : groove.fr}</p>
          <p className="m-0 text-sm text-muted">{lang === "en" ? groove.descEn : groove.descFr}</p>
        </div>
        <Button variant="outline" onClick={() => void play()} disabled={playing}>
          <Play size={14} /> {t("ui.listen")}
        </Button>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>
        {Array.from({ length: 16 }).map((_, s) => (
          <span
            key={s}
            className={cn(
              "h-4 flex-1 rounded-[3px] border transition-colors",
              lit === s ? "border-gold bg-gold" : groove.steps[s].length ? "border-line bg-raised" : "border-line/50 bg-transparent",
              s % 4 === 0 && "ml-0.5",
            )}
          />
        ))}
      </div>
    </div>
  );
}
