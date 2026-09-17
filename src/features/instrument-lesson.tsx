import { useState, type ReactNode } from "react";
import { BackLink } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import type { Mcq } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";

/**
 * Leçon d'instrument (basse / batterie) : intro + bloc interactif + quiz,
 * validation via le store partagé (XP, streak, badges auto).
 */
export function InstrumentLesson({
  lessonId,
  kicker,
  title,
  intros,
  interactive,
  mcqs,
  backLabel,
  nextTitle,
  onExit,
  onNext,
}: {
  lessonId: string;
  kicker: string;
  title: string;
  intros: string[];
  interactive?: ReactNode;
  mcqs: Mcq[];
  backLabel: string;
  nextTitle: string | null;
  onExit: () => void;
  onNext: (() => void) | null;
}) {
  const t = useT();
  const lang = useLang();
  const completeLesson = useProgress((s) => s.completeLesson);
  const [pct, setPct] = useState<number | null>(null);

  return (
    <Page>
      <BackLink onClick={onExit} label={backLabel} />
      <Title kicker={kicker}>{title}</Title>
      {intros.map((p, i) => (
        <p key={p.slice(0, 24)} className={i === 0 ? "mb-4 max-w-xl text-base leading-relaxed text-fg" : "mb-4 max-w-xl text-[15px] leading-relaxed text-muted"}>
          {p}
        </p>
      ))}
      {interactive && <div className="mt-6 mb-2">{interactive}</div>}
      {pct === null ? (
        <div className="mt-6">
          <QuizBlock
            questions={mcqs}
            onDone={(p) => {
              completeLesson(lessonId, p);
              setPct(p);
            }}
          />
        </div>
      ) : (
        <div className="mt-6">
          <Recap
            score={pct}
            total={100}
            onRetry={() => setPct(null)}
            onBack={() => {
              if (pct >= 60 && onNext) onNext();
              else onExit();
            }}
            perfect={
              pct >= 60 && nextTitle
                ? lang === "en" ? `Passed. Next: ${nextTitle}.` : `Validé. Suite : ${nextTitle}.`
                : t("ui.validated")
            }
            ok={t("ui.below60")}
          />
        </div>
      )}
    </Page>
  );
}
