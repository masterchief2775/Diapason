import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackLink, Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { BAT_EXAM, BAT_ORDER } from "@/lib/curriculum-batterie";
import { instQuestions } from "@/lib/instrument-curriculum";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/batterie/examen")({ component: BatExamen });

function BatExamen() {
  const t = useT();
  const lang = useLang();
  const nav = useNavigate();
  const addXp = useProgress((s) => s.addXp);
  const setScore = useProgress((s) => s.setScore);
  const scores = useProgress((s) => s.scores);
  const completed = useProgress((s) => s.completed);
  const [active, setActive] = useState(false);
  const [pct, setPct] = useState(0);
  const [finished, setFinished] = useState(false);

  // Même verrou que le bouton du parcours : accès direct par URL interdit
  // tant que les 4 leçons ne sont pas terminées.
  if (!BAT_ORDER.every((id) => completed.includes(id))) {
    return (
      <Page>
        <BackLink onClick={() => nav({ to: "/batterie/parcours" })} label={t("bat.pathK")} />
        <div className="flex items-center gap-3 text-muted">
          <Lock size={18} />
          <p>{t("lesson.locked")} « {lang === "en" ? BAT_EXAM.titleEn : BAT_EXAM.titleFr} ».</p>
        </div>
      </Page>
    );
  }

  if (active && !finished) {
    return (
      <Page>
        <Title kicker={t("bat.examK")}>
          {lang === "en" ? BAT_EXAM.titleEn : BAT_EXAM.titleFr}
        </Title>
        <QuizBlock
          questions={instQuestions(lang, BAT_EXAM.questions)}
          onDone={(p) => {
            const prev = scores[BAT_EXAM.id] ?? 0;
            setPct(p);
            setScore(BAT_EXAM.id, p);
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
          total={100}
          onRetry={() => {
            setFinished(false);
            setActive(true);
          }}
          onBack={() => nav({ to: "/batterie/parcours" })}
          perfect={lang === "en" ? "Drummer level validated (+50 XP). The “Confirmed drummer” badge is yours." : "Niveau de batteur validé (+50 XP). Le badge « Batteur confirmé » est à toi."}
          ok={lang === "en" ? "Below 60%: replay the 4 lessons, then come back." : "Sous les 60 % : rejoue les 4 leçons, puis reviens."}
        />
        {!pass && (
          <p className="mt-4 text-center text-xs text-subtle">
            {lang === "en" ? "Tip: the kit, tempo and grooves lessons cover everything." : "Conseil : les leçons kit, tempo et rythmes couvrent tout."}
          </p>
        )}
      </Page>
    );
  }

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/batterie/parcours" })} label={t("bat.pathK")} />
      <Title kicker={t("bat.examK")} lead={lang === "en" ? BAT_EXAM.leadEn : BAT_EXAM.leadFr}>
        {lang === "en" ? BAT_EXAM.titleEn : BAT_EXAM.titleFr}
      </Title>
      {scores[BAT_EXAM.id] != null && (
        <p className="mb-4 font-mono text-sm text-sage">{lang === "en" ? "Last" : "Dernier"} : {scores[BAT_EXAM.id]} %</p>
      )}
      <Button onClick={() => setActive(true)}>
        {lang === "en" ? "Take the exam" : "Passer l'examen"}
      </Button>
    </Page>
  );
}
