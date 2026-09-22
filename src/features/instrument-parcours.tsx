import { Lock } from "lucide-react";
import { BackLink } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { useT, type Lang } from "@/lib/i18n";
import { instUnlocked } from "@/lib/instrument-curriculum";
import { cn } from "@/lib/utils";

/**
 * Parcours d'instrument (basse / batterie) : liste des leçons avec verrous
 * séquentiels + carte examen. Navigation injectée (routes typées côté appelant).
 */
export function InstrumentParcours({
  kicker,
  title,
  lead,
  hubLabel,
  lessons,
  order,
  completed,
  scores,
  examScore,
  examTitle,
  onExit,
  onLesson,
  onExam,
  lang,
}: {
  kicker: string;
  title: string;
  lead: string;
  hubLabel: string;
  lessons: { id: string; titleFr: string; titleEn: string }[];
  order: string[];
  completed: string[];
  scores: Record<string, number>;
  examScore: number;
  examTitle: string;
  onExit: () => void;
  onLesson: (id: string) => void;
  onExam: () => void;
  lang: Lang;
}) {
  const t = useT();
  const doneCount = order.filter((id) => completed.includes(id)).length;
  const examOpen = doneCount >= order.length;

  return (
    <Page>
      <BackLink onClick={onExit} label={hubLabel} />
      <Title kicker={kicker} lead={lead}>
        {title}
      </Title>
      <div className="panel-sheen mb-4 rounded-2xl border border-line bg-surface p-5 shadow-sm md:p-6">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-mono text-xs text-gold">{t("home.phase")} 1</span>
          <span className="font-display text-lg">{title}</span>
          <span className="ml-auto font-mono text-xs text-subtle">{doneCount}/{order.length}</span>
        </div>
        <div className="track mb-3 h-1">
          <div className="fill-sage h-full" style={{ width: `${order.length ? (doneCount / order.length) * 100 : 0}%` }} />
        </div>
        <ul className="m-0 list-none p-0">
          {lessons.map((l) => {
            const done = completed.includes(l.id);
            // Verrou par id (pas par position) : robuste à tout réordonnancement.
            const open = instUnlocked(order, completed, l.id);
            const sc = scores[l.id];
            return (
              <li key={l.id} className="border-t border-line py-2 text-sm first:border-t-0">
                {open ? (
                  <button
                    type="button"
                    onClick={() => onLesson(l.id)}
                    className="group flex w-full items-center gap-2.5 bg-transparent p-0 text-left text-inherit"
                  >
                    <span className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[10px]",
                      done ? "border-sage bg-sage-dim text-sage" : "border-line text-subtle group-hover:border-gold group-hover:text-gold",
                    )}>
                      {done ? "✓" : "·"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-muted group-hover:text-fg">{lang === "en" ? l.titleEn : l.titleFr}</span>
                      {sc != null && <span className="block font-mono text-[11px] text-sage">{sc} %</span>}
                    </span>
                  </button>
                ) : (
                  <span className="flex items-center gap-2.5 text-subtle">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line">
                      <Lock size={10} />
                    </span>
                    <span className="truncate">{lang === "en" ? l.titleEn : l.titleFr}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <button
        type="button"
        onClick={onExam}
        disabled={!examOpen}
        className="panel-sheen flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-4 text-left shadow-sm transition-transform enabled:active:scale-[0.99] disabled:opacity-60"
      >
        {!examOpen && <Lock size={16} className="shrink-0 text-subtle" />}
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-medium">{examTitle}</p>
          <p className="m-0 truncate text-xs text-subtle">
            {examOpen
              ? examScore > 0 ? `${examScore} %` : t("ui.startExercise")
              : `${doneCount}/${order.length}`}
          </p>
        </div>
      </button>
    </Page>
  );
}
