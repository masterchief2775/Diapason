import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Play, Volume2 } from "lucide-react";
import { BassNeck } from "@/components/bass-neck";
import { BackLink, Button, Chip } from "@/components/ui";
import { Page } from "@/features/page";
import { InstrumentLesson } from "@/features/instrument-lesson";
import { BASSE_LESSONS, BASSE_ORDER } from "@/lib/curriculum-basse";
import { instQuestions, instUnlocked } from "@/lib/instrument-curriculum";
import { BASS_PATTERNS, playBassPattern, playBassTuning } from "@/lib/bass";
import { useProgress } from "@/lib/progress";
import { useLang, useNN, useT } from "@/lib/i18n";

export const Route = createFileRoute("/basse/lecon/$id")({ component: BasseLecon });

const ALL12 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function BasseLecon() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const lang = useLang();
  const t = useT();
  const completed = useProgress((s) => s.completed);
  const lesson = BASSE_LESSONS.find((l) => l.id === id);

  if (!lesson) {
    return (
      <Page>
        <p>{t("lesson.notFound")}</p>
      </Page>
    );
  }
  if (!instUnlocked(BASSE_ORDER, completed, id)) {
    return (
      <Page>
        <BackLink onClick={() => nav({ to: "/basse/parcours" })} label={t("basse.pathK")} />
        <div className="flex items-center gap-3 text-muted">
          <Lock size={18} />
          <p>{t("lesson.locked")} « {lang === "en" ? lesson.titleEn : lesson.titleFr} ».</p>
        </div>
      </Page>
    );
  }

  const idx = BASSE_ORDER.indexOf(id);
  const nextId = BASSE_ORDER[idx + 1] ?? null;
  const nextLesson = nextId ? BASSE_LESSONS.find((l) => l.id === nextId) : null;

  return (
    <InstrumentLesson
      key={id}
      lessonId={id}
      kicker={`${t("basse.courseK")} · ${idx + 1}/4`}
      title={lang === "en" ? lesson.titleEn : lesson.titleFr}
      intros={lang === "en" ? lesson.introEn : lesson.introFr}
      interactive={<BasseInteractive id={id} />}
      mcqs={instQuestions(lang, lesson.questions)}
      backLabel={t("basse.pathK")}
      nextTitle={nextLesson ? (lang === "en" ? nextLesson.titleEn : nextLesson.titleFr) : null}
      onExit={() => nav({ to: "/basse/parcours" })}
      onNext={nextId ? () => nav({ to: "/basse/lecon/$id", params: { id: nextId } }) : null}
      fanfareTimbre="basse"
    />
  );
}

function BasseInteractive({ id }: { id: string }) {
  const t = useT();
  const lang = useLang();
  const nn = useNN();

  if (id === "basse-role") {
    return (
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <p className="m-0 mb-3 text-sm text-muted">{t("basse.tuningLead")}</p>
        <Button variant="outline" onClick={() => void playBassTuning()}>
          <Volume2 size={15} /> {t("basse.playAll")} · Mi – La – Ré – Sol
        </Button>
      </div>
    );
  }
  if (id === "basse-notes") {
    return <BassNeck highlight={{ rootIndex: 0, steps: ALL12 }} hear />;
  }
  if (id === "basse-gammes") {
    return <BasseScaleExplorer />;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {BASS_PATTERNS.map((p) => (
        <div key={p.id} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 mb-1 font-display text-base">{lang === "en" ? p.en : p.fr}</p>
          <p className="m-0 mb-3 font-mono text-xs text-gold">
            {p.offsets.map((o) => `${nn[o % 12]}${o >= 12 ? "⁺" : ""}`).join(" – ")}
          </p>
          <Button variant="outline" onClick={() => void playBassPattern(p.offsets)}>
            <Play size={14} /> {t("ui.listen")}
          </Button>
        </div>
      ))}
    </div>
  );
}

function BasseScaleExplorer() {
  const lang = useLang();
  const nn = useNN();
  const [root, setRoot] = useState(0);
  const [minor, setMinor] = useState(false);
  const steps = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {nn.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex gap-1.5">
        <Chip tone="sage" active={!minor} onClick={() => setMinor(false)}>
          {lang === "en" ? "Major" : "Majeure"}
        </Chip>
        <Chip tone="sage" active={minor} onClick={() => setMinor(true)}>
          {lang === "en" ? "Minor" : "Mineure"}
        </Chip>
      </div>
      <BassNeck highlight={{ rootIndex: root, steps }} hear />
    </div>
  );
}
