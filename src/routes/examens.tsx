import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { EXAMS, type ExamDef } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/examens")({ component: ExamensPage });

function ExamensPage() {
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const addXp = useProgress((s) => s.addXp);
  const setScore = useProgress((s) => s.setScore);
  const nav = useNavigate();
  const [active, setActive] = useState<ExamDef | null>(null);
  const [pct, setPct] = useState(0);
  const [finished, setFinished] = useState(false);

  if (active && !finished) {
    return (
      <Page>
        <Title kicker="Examen bloquant">{active.title}</Title>
        <QuizBlock
          questions={active.questions}
          onDone={(p) => {
            setPct(p);
            setScore(active.id, p);
            if (p >= 60) addXp(50);
            setFinished(true);
          }}
        />
      </Page>
    );
  }

  if (active && finished) {
    const pass = pct >= 60;
    return (
      <Page>
        <Recap
          score={pct}
          total={0}
          onRetry={() => {
            setFinished(false);
            setActive({ ...active });
          }}
          onBack={() => {
            setActive(null);
            setFinished(false);
            nav({ to: "/examens" });
          }}
          perfect="Examen validé (+50 XP). Tu peux attaquer la phase suivante l'esprit léger."
          ok="Sous les 60 % : revois les leçons de la phase, puis reviens. Rien n'est bloqué, mais vise la validation."
        />
        {!pass && <p className="mt-4 text-center text-xs text-subtle">Conseil : refais les quiz de chaque leçon avant de retenter.</p>}
      </Page>
    );
  }

  return (
    <Page>
      <Title kicker="Évaluation" lead="3 examens calés sur les phases. 60 % pour valider, 80 %+ pour briller. Non bloquants, mais recommandés.">
        Examens de niveau
      </Title>
      <div className="flex flex-col gap-3">
        {EXAMS.map((e) => {
          const open = completed.length >= e.unlockAt;
          const prev = scores[e.id];
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-4">
              {!open && <Lock size={16} className="text-subtle" />}
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-medium">{e.title}</p>
                <p className="m-0 truncate text-xs text-subtle">{e.range} · {e.questions.length} questions</p>
                {prev != null && <p className="m-0 font-mono text-xs text-sage">Dernier : {prev} %</p>}
              </div>
              <Button disabled={!open} onClick={() => setActive(e)}>
                {open ? "Passer" : `${completed.length}/${e.unlockAt}`}
              </Button>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
