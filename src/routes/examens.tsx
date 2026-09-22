import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { EXAMS, examQuestions, type ExamDef } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/examens")({ component: ExamensPage });

function ExamensPage() {
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const addXp = useProgress((s) => s.addXp);
  const setScore = useProgress((s) => s.setScore);
  const nav = useNavigate();
  const lang = useLang();
  const [active, setActive] = useState<ExamDef | null>(null);
  const [pct, setPct] = useState(0);
  const [finished, setFinished] = useState(false);

  if (active && !finished) {
    return (
      <Page>
        <Title kicker={lang === "en" ? "Blocking exam" : "Examen bloquant"}>
          {lang === "en" ? active.titleEn : active.title}
        </Title>
        <QuizBlock
          questions={examQuestions(lang, active.id)}
          onDone={(p) => {
            const prev = scores[active.id] ?? 0;
            setPct(p);
            setScore(active.id, p);
            // +50 XP à la première validation uniquement (anti-farming).
            if (p >= 60 && prev < 60) addXp(50, "feed.exam");
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
          perfect={lang === "en" ? "Exam passed (+50 XP). You can attack the next phase with a light mind." : "Examen validé (+50 XP). Tu peux attaquer la phase suivante l'esprit léger."}
          ok={lang === "en" ? "Below 60%: review the phase lessons, then come back. Nothing is blocked, but aim to pass." : "Sous les 60 % : revois les leçons de la phase, puis reviens. Rien n'est bloqué, mais vise la validation."}
        />
        {!pass && (
          <p className="mt-4 text-center text-xs text-subtle">
            {lang === "en" ? "Tip: redo each lesson's quiz before retrying." : "Conseil : refais les quiz de chaque leçon avant de retenter."}
          </p>
        )}
      </Page>
    );
  }

  return (
    <Page>
      <Title
        kicker={lang === "en" ? "Assessment" : "Évaluation"}
        lead={lang === "en" ? "3 exams mapped to phases. 60% to pass, 80%+ to shine. Advisory, not blocking." : "3 examens calés sur les phases. 60 % pour valider, 80 %+ pour briller. Non bloquants, mais recommandés."}
      >
        {lang === "en" ? "Level exams" : "Examens de niveau"}
      </Title>
      <div className="flex flex-col gap-3">
        {EXAMS.map((e) => {
          const open = completed.length >= e.unlockAt;
          const prev = scores[e.id];
          return (
            <div key={e.id} className="panel-sheen flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-4 shadow-sm">
              {!open && <Lock size={16} className="text-subtle" />}
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-medium">{lang === "en" ? e.titleEn : e.title}</p>
                <p className="m-0 truncate text-xs text-subtle">
                  {lang === "en" ? e.rangeEn : e.range} · {e.questions.length} {lang === "en" ? "questions" : "questions"}
                </p>
                {prev != null && <p className="m-0 font-mono text-xs text-sage">{lang === "en" ? "Last" : "Dernier"} : {prev} %</p>}
              </div>
              <Button disabled={!open} onClick={() => setActive(e)}>
                {open ? (lang === "en" ? "Take" : "Passer") : `${completed.length}/${e.unlockAt}`}
              </Button>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
