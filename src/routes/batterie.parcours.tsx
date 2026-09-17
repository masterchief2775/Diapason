import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InstrumentParcours } from "@/features/instrument-parcours";
import { BAT_LESSONS, BAT_ORDER } from "@/lib/curriculum-batterie";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/batterie/parcours")({ component: BatParcours });

function BatParcours() {
  const t = useT();
  const lang = useLang();
  const nav = useNavigate();
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const examScore = scores["bat-examen"] ?? 0;

  return (
    <InstrumentParcours
      kicker={t("bat.courseK")}
      title={t("bat.pathT")}
      lead={t("bat.courseLead")}
      hubLabel={t("nav.batterie")}
      lessons={BAT_LESSONS}
      order={BAT_ORDER}
      completed={completed}
      scores={scores}
      examScore={examScore}
      examTitle={lang === "en" ? "Drummer exam" : "Examen du batteur"}
      onExit={() => nav({ to: "/batterie" })}
      onLesson={(id) => nav({ to: "/batterie/lecon/$id", params: { id } })}
      onExam={() => nav({ to: "/batterie/examen" })}
      lang={lang}
    />
  );
}
