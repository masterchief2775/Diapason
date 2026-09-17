import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Lock, Play, Square } from "lucide-react";
import { DrumPads } from "@/components/drum-pads";
import { GrooveCard } from "@/components/groove-card";
import { BackLink, Button } from "@/components/ui";
import { Page } from "@/features/page";
import { InstrumentLesson } from "@/features/instrument-lesson";
import { BAT_LESSONS, BAT_ORDER } from "@/lib/curriculum-batterie";
import { instQuestions, instUnlocked } from "@/lib/instrument-curriculum";
import { getAudioContext, playClick, resumeAudio } from "@/lib/audio";
import { GROOVES, playDemoFill } from "@/lib/grooves";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/batterie/lecon/$id")({ component: BatLecon });

function BatLecon() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const lang = useLang();
  const t = useT();
  const completed = useProgress((s) => s.completed);
  const lesson = BAT_LESSONS.find((l) => l.id === id);

  if (!lesson) {
    return (
      <Page>
        <p>{t("lesson.notFound")}</p>
      </Page>
    );
  }
  if (!instUnlocked(BAT_ORDER, completed, id)) {
    return (
      <Page>
        <BackLink onClick={() => nav({ to: "/batterie/parcours" })} label={t("bat.pathK")} />
        <div className="flex items-center gap-3 text-muted">
          <Lock size={18} />
          <p>{t("lesson.locked")} « {lang === "en" ? lesson.titleEn : lesson.titleFr} ».</p>
        </div>
      </Page>
    );
  }

  const idx = BAT_ORDER.indexOf(id);
  const nextId = BAT_ORDER[idx + 1] ?? null;
  const nextLesson = nextId ? BAT_LESSONS.find((l) => l.id === nextId) : null;

  return (
    <InstrumentLesson
      key={id}
      lessonId={id}
      kicker={`${t("bat.courseK")} · ${idx + 1}/4`}
      title={lang === "en" ? lesson.titleEn : lesson.titleFr}
      intros={lang === "en" ? lesson.introEn : lesson.introFr}
      interactive={<BatInteractive id={id} />}
      mcqs={instQuestions(lang, lesson.questions)}
      backLabel={t("bat.pathK")}
      nextTitle={nextLesson ? (lang === "en" ? nextLesson.titleEn : nextLesson.titleFr) : null}
      onExit={() => nav({ to: "/batterie/parcours" })}
      onNext={nextId ? () => nav({ to: "/batterie/lecon/$id", params: { id: nextId } }) : null}
    />
  );
}

function BatInteractive({ id }: { id: string }) {
  const t = useT();
  const lang = useLang();

  if (id === "bat-kit") return <DrumPads />;
  if (id === "bat-tempo") return <Metronome />;
  if (id === "bat-grooves") {
    return (
      <div className="grid gap-2 md:grid-cols-2">
        {GROOVES.map((g) => (
          <GrooveCard key={g.id} groove={g} bpm={100} />
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <p className="m-0 mb-3 text-sm text-muted">
        {lang === "en"
          ? "One bar: snare, snare, low tom, high tom, crash on the 1."
          : "Une mesure : claire, claire, tom grave, tom aigu, crash sur le 1."}
      </p>
      <Button variant="outline" onClick={() => void playDemoFill()}>
        <Play size={14} /> {t("ui.listen")}
      </Button>
    </div>
  );
}

/** Métronome simple : clic accentué sur le temps 1, tempo réglable. */
function Metronome() {
  const t = useT();
  const [bpm, setBpm] = useState(96);
  const [on, setOn] = useState(false);
  const timer = useRef<number | null>(null);
  const beat = useRef(0);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setOn(false);
  };

  const toggle = async () => {
    if (on) {
      stop();
      return;
    }
    await resumeAudio();
    beat.current = 0;
    const tick = () => {
      const ctx = getAudioContext();
      playClick(ctx, ctx.currentTime, beat.current % 4 === 0);
      beat.current += 1;
    };
    tick();
    timer.current = window.setInterval(tick, 60000 / bpm);
    setOn(true);
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-xs text-subtle">{t("bat.tempo")}</span>
        <input
          type="range"
          min={60}
          max={160}
          step={2}
          value={bpm}
          onChange={(e) => {
            stop();
            setBpm(Number(e.target.value));
          }}
          className="flex-1"
          aria-label={t("bat.tempo")}
        />
        <span className="w-16 text-right font-mono text-xs text-gold">{bpm} BPM</span>
      </div>
      <Button onClick={() => void toggle()} variant={on ? "danger" : "primary"}>
        {on ? <Square size={14} /> : <Play size={14} />}
        {on ? (t("ui.done")) : `${t("ui.listen")} · 4/4`}
      </Button>
    </div>
  );
}
