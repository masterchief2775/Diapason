import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InstrumentParcours } from "@/features/instrument-parcours";
import { BASSE_LESSONS, BASSE_ORDER } from "@/lib/curriculum-basse";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/basse/parcours")({ component: BasseParcours });

function BasseParcours() {
  const t = useT();
  const lang = useLang();
  const nav = useNavigate();
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const examScore = scores["basse-examen"] ?? 0;

  return (
    <InstrumentParcours
      kicker={t("basse.courseK")}
      title={t("basse.pathT")}
      lead={t("basse.courseLead")}
      hubLabel={t("nav.basse")}
      lessons={BASSE_LESSONS}
      order={BASSE_ORDER}
      completed={completed}
      scores={scores}
      examScore={examScore}
      examTitle={lang === "en" ? "Bassist exam" : "Examen du bassiste"}
      onExit={() => nav({ to: "/basse" })}
      onLesson={(id) => nav({ to: "/basse/lecon/$id", params: { id } })}
      onExam={() => nav({ to: "/basse/examen" })}
      lang={lang}
    />
  );
}
