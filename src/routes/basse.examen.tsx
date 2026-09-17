import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackLink, Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { BASSE_EXAM } from "@/lib/curriculum-basse";
import { instQuestions } from "@/lib/instrument-curriculum";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/basse/examen")({ component: BasseExamen });

function BasseExamen() {
  const t = useT();
  const lang = useLang();
  const nav = useNavigate();
  const addXp = useProgress((s) => s.addXp);
  const setScore = useProgress((s) => s.setScore);
  const scores = useProgress((s) => s.scores);
  const [active, setActive] = useState(false);
  const [pct, setPct] = useState(0);
  const [finished, setFinished] = useState(false);

  if (active && !finished) {
    return (
      <Page>
        <Title kicker={t("basse.examK")}>
          {lang === "en" ? BASSE_EXAM.titleEn : BASSE_EXAM.titleFr}
        </Title>
        <QuizBlock
          questions={instQuestions(lang, BASSE_EXAM.questions)}
          onDone={(p) => {
            setPct(p);
            setScore(BASSE_EXAM.id, p);
            if (p >= 60) addXp(50, "feed.exam");
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
          onBack={() => nav({ to: "/basse/parcours" })}
          perfect={lang === "en" ? "Bassist level validated (+50 XP). The “Confirmed bassist” badge is yours." : "Niveau de bassiste validé (+50 XP). Le badge « Bassiste confirmé » est à toi."}
          ok={lang === "en" ? "Below 60%: replay the 4 lessons, then come back." : "Sous les 60 % : rejoue les 4 leçons, puis reviens."}
        />
        {!pass && (
          <p className="mt-4 text-center text-xs text-subtle">
            {lang === "en" ? "Tip: the tuning, triad and walking lessons cover everything." : "Conseil : les leçons accordage, triade et walking couvrent tout."}
          </p>
        )}
      </Page>
    );
  }

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/basse/parcours" })} label={t("basse.pathK")} />
      <Title kicker={t("basse.examK")} lead={lang === "en" ? BASSE_EXAM.leadEn : BASSE_EXAM.leadFr}>
        {lang === "en" ? BASSE_EXAM.titleEn : BASSE_EXAM.titleFr}
      </Title>
      {scores[BASSE_EXAM.id] != null && (
        <p className="mb-4 font-mono text-sm text-sage">{lang === "en" ? "Last" : "Dernier"} : {scores[BASSE_EXAM.id]} %</p>
      )}
      <Button onClick={() => setActive(true)}>
        {lang === "en" ? "Take the exam" : "Passer l'examen"}
      </Button>
    </Page>
  );
}
