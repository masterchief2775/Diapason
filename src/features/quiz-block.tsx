import { useState } from "react";
import { Button } from "@/components/ui";
import type { Mcq } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

export function QuizBlock({
  questions,
  onDone,
}: {
  questions: Mcq[];
  onDone: (percent: number) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = questions[i];
  const last = i + 1 >= questions.length;

  if (!q) return null;

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>
          Question {i + 1} / {questions.length}
        </span>
        <span className="text-sage">Score {score}</span>
      </div>
      <h2 className="mb-5 font-display text-xl font-medium">{q.q}</h2>
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
              onClick={() => {
                setPicked(idx);
                if (idx === q.answer) setScore((s) => s + 1);
              }}
              className={cn(
                "rounded-md border px-4 py-3 text-left text-sm",
                !show && "border-line bg-surface text-fg",
                show && ok && "border-sage bg-sage-dim text-sage",
                show && mine && !ok && "border-danger bg-danger-dim text-danger",
                show && !ok && !mine && "border-line bg-surface text-muted",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4">
          <p className="mb-4 text-sm leading-relaxed text-muted">{q.explain}</p>
          <Button
            onClick={() => {
              if (last) {
                const nextScore = score;
                onDone(Math.round((nextScore / questions.length) * 100));
              } else {
                setI((n) => n + 1);
                setPicked(null);
              }
            }}
          >
            {last ? "Voir le résultat" : "Suivant"}
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
  return (
    <div className="pt-10 text-center">
      <p className="font-mono text-xs text-gold">Terminé</p>
      <h2 className="mt-1 font-display text-3xl">
        {total ? `${score} / ${total}` : `${pct} %`}
      </h2>
      <p className="mx-auto mt-2 mb-8 max-w-md text-sm text-muted">{pct >= 80 ? perfect : ok}</p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={onRetry}>
          Refaire
        </Button>
        <Button onClick={onBack}>Continuer</Button>
      </div>
    </div>
  );
}
