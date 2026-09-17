import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button, ScoreRing } from "@/components/ui";
import type { Mcq } from "@/lib/curriculum";
import { playFanfare } from "@/lib/audio";
import { burst } from "@/lib/confetti";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizBlock({
  questions,
  onDone,
  onAnswers,
}: {
  questions: Mcq[];
  onDone: (percent: number) => void;
  onAnswers?: (answers: number[]) => void;
}) {
  const t = useT();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const q = questions[i];
  const last = i + 1 >= questions.length;

  if (!q) return null;

  const choose = (idx: number) => {
    setPicked(idx);
    setAnswers((a) => [...a, idx]);
    if (idx === q.answer) setScore((s) => s + 1);
  };

  return (
    <div className="pop-in" key={i}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5" aria-hidden>
          {questions.map((_, d) => (
            <span
              key={d}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                d < i ? "bg-sage" : d === i ? "bg-gold" : "bg-line",
              )}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-subtle">
          {t("ui.question")} {i + 1} / {questions.length} · <span className="text-sage">{score}</span>
        </span>
      </div>
      <h2 className="mb-5 font-display text-xl font-medium text-balance">{q.q}</h2>
      <div className="grid gap-2">
        {q.options.map((opt, idx) => {
          const show = picked !== null;
          const ok = idx === q.answer;
          const mine = idx === picked;
          return (
            <button
              key={opt}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(idx)}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-all active:scale-[0.99]",
                !show && "border-line bg-surface text-fg hover:border-gold/70 hover:bg-raised",
                show && ok && "border-sage bg-sage-dim text-sage shadow-sm",
                show && mine && !ok && "border-danger bg-danger-dim text-danger",
                show && !ok && !mine && "border-line bg-surface text-subtle opacity-70",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-md border font-mono text-[11px]",
                  !show && "border-line text-subtle group-hover:border-gold group-hover:text-gold",
                  show && ok && "border-sage text-sage",
                  show && mine && !ok && "border-danger text-danger",
                  show && !ok && !mine && "border-line text-subtle",
                )}
              >
                {show && ok ? <Check size={13} /> : show && mine && !ok ? <X size={13} /> : LETTERS[idx]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="pop-in mt-4 rounded-lg border border-line bg-raised px-4 py-3">
          <p className="m-0 text-sm leading-relaxed text-muted">{q.explain}</p>
          <Button
            className="mt-3"
            onClick={() => {
              if (last) {
                const nextScore = score;
                onAnswers?.(answers);
                onDone(Math.round((nextScore / questions.length) * 100));
              } else {
                setI((n) => n + 1);
                setPicked(null);
              }
            }}
          >
            {last ? t("ui.result") : t("ui.next")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function Recap({
  score,
  total,
  onRetry,
  onBack,
  perfect,
  ok,
}: {
  score: number;
  total: number;
  onRetry: () => void;
  onBack: () => void;
  perfect: string;
  ok: string;
}) {
  const pct = total ? Math.round((score / total) * 100) : score;
  const t = useT();
  const passed = pct >= 60;
  // Célébration d'arrivée : confettis + fanfare quand c'est validé.
  useEffect(() => {
    if ((total > 0 && pct >= 60) || (total === 0 && score > 0)) {
      burst({ count: 50 });
      playFanfare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="pop-in pt-6 text-center">
      <p className="font-mono text-xs tracking-widest text-gold uppercase">{t("ui.done")}</p>
      <div className="mt-3 mb-1 flex justify-center">
        <ScoreRing percent={total ? pct : score} />
      </div>
      {total > 0 && (
        <p className="m-0 font-mono text-sm text-subtle">
          {score} / {total}
        </p>
      )}
      <p className={cn("mx-auto mt-3 mb-8 max-w-md text-sm", passed ? "text-sage" : "text-muted")}>
        {pct >= 80 ? perfect : ok}
      </p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={onRetry}>
          {t("ui.retry")}
        </Button>
        <Button onClick={onBack}>{t("ui.continue")}</Button>
      </div>
    </div>
  );
}
