import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Fretboard, NoteSymbol } from "@/components/fretboard";
import { BackLink, Button, Chip } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { resumeAudio, playChordNow, playClick, getAudioContext, playTone, freqForOffset } from "@/lib/audio";
import { LESSONS, QUIZZES, lessonById, lessonText, quizFor } from "@/lib/curriculum";
import { useLang, useNN, useT } from "@/lib/i18n";
import {
  CAGED,
  CHORD_QUALITIES,
  GENRES,
  INTERVALS,
  INVERSIONS,
  MODES_MAJOR,
  NOTE_VALUES,
  PROGRESSION_LIBRARY,
  PROGRESSION_PRESETS,
  SCALES,
  TUNING,
  buildMidiFile,
  degreeChord,
  downloadBytes,
  inversionVoicing,
  noteAt,
  renderTabText,
  suggestNextDegrees,
  type ModeKey,
} from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function LessonView({ id }: { id: string }) {
  const lesson = lessonById(id);
  const nav = useNavigate();
  const t = useT();
  const lang = useLang();
  const unlocked = useProgress((s) => s.isUnlocked(id));
  const completeLesson = useProgress((s) => s.completeLesson);

  if (!lesson) {
    return (
      <Page>
        <BackLink onClick={() => nav({ to: "/parcours" })} label={t("nav.path")} />
        <p>{t("lesson.notFound")}</p>
      </Page>
    );
  }
  const txt = lessonText(lang, lesson);

  if (!unlocked) {
    return (
      <Page>
        <BackLink onClick={() => nav({ to: "/parcours" })} label={t("nav.path")} />
        <div className="flex items-center gap-3 text-muted">
          <Lock size={18} />
          <p>{t("lesson.locked")} « {txt.title} ».</p>
        </div>
      </Page>
    );
  }

  const finish = (percent: number) => completeLesson(id, percent);

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/parcours" })} label={t("nav.path")} />
      <Title kicker={`${t("home.phase")} ${lesson.phase} · ${LESSONS.filter((l) => l.phase === lesson.phase).findIndex((l) => l.id === id) + 1}`} >
        {txt.title}
      </Title>
      {id === "intervalles" && <IntervalExercise onFinish={finish} />}
      {id === "accords" && <ChordExercise onFinish={finish} />}
      {id === "rythme" && <RhythmExercise onFinish={finish} />}
      {id === "manche" && <MancheExercise onFinish={finish} />}
      {id === "gamme-maj" && <MajorScaleExercise onFinish={finish} />}
      {id === "gammes" && <ScalesExplorer onFinish={finish} />}
      {id === "modes" && <ModesExercise onFinish={finish} />}
      {id === "pentas" && <PentaExercise onFinish={finish} />}
      {id === "cadences" && <CadenceExercise onFinish={finish} />}
      {id === "voicings" && <VoicingsExercise onFinish={finish} />}
      {id === "modes-exo" && <ExoticExercise onFinish={finish} />}
      {id === "reharmo" && <ReharmoExercise onFinish={finish} />}
      {id === "analyse" && <AnalyseExercise onFinish={finish} />}
      {id === "secondaires" && <SecondairesExercise onFinish={finish} />}
      {id === "voix" && <VoixExercise onFinish={finish} />}
      {id === "metriques" && <MetriquesExercise onFinish={finish} />}
      {id === "melodie" && <MelodyMini onFinish={finish} />}
      {id === "genres" && <GenreMini onFinish={finish} />}
      {id === "projet" && <ProjetMini onFinish={finish} />}
      {/* Leçons SANS exercice dédié : quiz générique sur leur propre banque.
          (Toute leçon du parcours doit avoir soit un exercice ci-dessus, soit
          figurer ici — sinon la page est vide et la leçon jamais terminable,
          ce qui verrouille toute la suite du parcours.) */}
      {["notes", "structure", "harmonie-fonc"].includes(id) && QUIZZES[id] && (
        <TheoryQuiz
          intro={txt.intro}
          questions={quizFor(lang, id)}
          onFinish={finish}
        />
      )}
    </Page>
  );
}

function TheoryQuiz({
  intro,
  questions,
  onFinish,
}: {
  intro: string[];
  questions: { q: string; options: string[]; answer: number; explain: string }[];
  onFinish: (p: number) => void;
}) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "recap">("intro");
  const [pct, setPct] = useState(0);
  const t = useT();
  const nav = useNavigate();
  if (phase === "intro") {
    return (
      <>
        {intro.map((p, i) => (
          <p key={p} className={i === 0 ? "mb-4 max-w-xl text-base leading-relaxed text-fg" : "mb-4 max-w-xl text-[15px] leading-relaxed text-muted"}>
            {p}
          </p>
        ))}
        <Button onClick={() => setPhase("quiz")}>{t("ui.startQuiz")}</Button>
      </>
    );
  }
  if (phase === "quiz") {
    return (
      <QuizBlock
        questions={questions}
        onDone={(p) => {
          setPct(p);
          onFinish(p);
          setPhase("recap");
        }}
      />
    );
  }
  return (
    <Recap
      score={pct}
      total={0}
      onRetry={() => setPhase("quiz")}
      onBack={() => nav({ to: "/parcours" })}
      perfect={t("lesson.solid")}
      ok={t("lesson.retry60")}
    />
  );
}

function IntervalExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "recap">("intro");
  const [q, setQ] = useState<(typeof INTERVALS)[number] | null>(null);
  const [fb, setFb] = useState<"ok" | "ko" | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const total = 5;
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const nav = useNavigate();
  const qLabel = q ? (lang === "en" ? q.labelEn : q.label) : "";

  const nextQ = () => {
    setQ(INTERVALS[Math.floor(Math.random() * INTERVALS.length)]);
    setFb(null);
  };

  const click = (s: number, f: number) => {
    if (s !== 0 || fb || !q) return;
    const ok = f === q.semis;
    setFb(ok ? "ok" : "ko");
    if (ok) setScore((x) => x + 1);
  };

  const go = () => {
    if (round + 1 >= total) {
      onFinish(Math.round((score / total) * 100));
      setPhase("recap");
    } else {
      setRound((r) => r + 1);
      nextQ();
    }
  };

  if (phase === "intro") {
    return (
      <>
        <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
          {t("iv.intro")}
        </p>
        <div className="mb-6">
          <Fretboard compact activeCells={[{ s: 0, f: 0 }]} highlight={{ rootIndex: TUNING[0], steps: [0] }} />
        </div>
        <Button
          onClick={() => {
            setPhase("quiz");
            setScore(0);
            setRound(0);
            nextQ();
          }}
        >
          {t("ui.startExercise")}
        </Button>
      </>
    );
  }

  if (phase === "quiz" && q) {
    return (
      <>
        <div className="mb-2 flex justify-between font-mono text-xs text-subtle">
          <span>
            {t("ui.question")} {round + 1} / {total}
          </span>
          <span className="text-sage">{t("ui.score")} {score}</span>
        </div>
        <h2 className="mb-5 font-display text-xl">
          {t("iv.click")} {qLabel} {t("iv.above").replace("Mi", nn[4])}
        </h2>
        <Fretboard highlight={{ rootIndex: TUNING[0], steps: [] }} onCellClick={click} />
        {fb && (
          <div
            className={cn(
              "mt-4 flex items-center justify-between rounded-md border px-4 py-3 text-sm",
              fb === "ok" ? "border-sage bg-sage-dim text-sage" : "border-danger bg-danger-dim text-danger",
            )}
          >
            <span>
              {fb === "ok"
                ? t("iv.exact")
                : `${qLabel} : ${q.semis} ${q.semis > 1 ? t("iv.cases") : t("iv.case")} ${t("iv.miss")}`}
            </span>
            <Button variant="outline" className="border-current text-inherit" onClick={go}>
              {round + 1 >= total ? t("ui.result") : t("ui.next")}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <Recap
      score={score}
      total={total}
      onRetry={() => {
        setPhase("quiz");
        setScore(0);
        setRound(0);
        nextQ();
      }}
      onBack={() => nav({ to: "/parcours" })}
      perfect={t("iv.perfect")}
      ok={t("iv.ok")}
    />
  );
}

function ChordExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(4);
  const [qid, setQid] = useState<(typeof CHORD_QUALITIES)[number]["id"]>("maj");
  const [phase, setPhase] = useState<"intro" | "game" | "recap">("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<{ root: number; q: (typeof CHORD_QUALITIES)[number] } | null>(null);
  const [picked, setPicked] = useState<{ s: number; f: number; note: number }[]>([]);
  const [fb, setFb] = useState<"ok" | "ko" | null>(null);
  const total = 4;
  const quality = CHORD_QUALITIES.find((q) => q.id === qid)!;
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const nav = useNavigate();
  const qLabel = (q: (typeof CHORD_QUALITIES)[number]) => (lang === "en" ? q.labelEn : q.label).toLowerCase();

  const newTarget = () => {
    const pool = CHORD_QUALITIES.filter((q) => q.formula.length === 3);
    const q = pool[Math.floor(Math.random() * pool.length)];
    setTarget({ root: Math.floor(Math.random() * 12), q });
    setPicked([]);
    setFb(null);
  };

  const click = (s: number, f: number) => {
    if (fb || !target) return;
    const note = noteAt(s, f);
    const already = picked.some((p) => p.s === s && p.f === f);
    const next = already ? picked.filter((p) => !(p.s === s && p.f === f)) : [...picked, { s, f, note }];
    setPicked(next);
    if (next.length === 3) {
      const setA = new Set<number>(next.map((p) => (p.note - target.root + 12) % 12));
      const setB = new Set<number>([...target.q.formula]);
      const ok = setA.size === setB.size && [...setA].every((v) => setB.has(v));
      setFb(ok ? "ok" : "ko");
      if (ok) setScore((x) => x + 1);
    }
  };

  if (phase === "intro") {
    return (
      <>
        <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
          {t("ch.intro")}
        </p>
        <div className="mb-3 flex flex-wrap gap-6">
          <div>
            <p className="mb-2 font-mono text-[11px] text-subtle">{t("ch.root")}</p>
            <div className="flex max-w-xs flex-wrap gap-1.5">
              {nn.map((n, i) => (
                <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] text-subtle">{t("ch.color")}</p>
            <div className="flex flex-wrap gap-1.5">
              {CHORD_QUALITIES.filter((q) => q.formula.length === 3).map((q) => (
                <Chip key={q.id} tone="sage" active={q.id === qid} onClick={() => setQid(q.id)}>
                  {lang === "en" ? q.labelEn : q.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <p className="mb-3 font-mono text-xs text-subtle">
          {nn[root]} {qLabel(quality)} · {quality.degrees}
        </p>
        <div className="mb-6">
          <Fretboard highlight={{ rootIndex: root, steps: quality.formula }} />
        </div>
        <Button
          onClick={() => {
            setPhase("game");
            setScore(0);
            setRound(0);
            newTarget();
          }}
        >
          {t("ch.play")}
        </Button>
      </>
    );
  }

  if (phase === "game" && target) {
    return (
      <>
        <div className="mb-2 flex justify-between font-mono text-xs text-subtle">
          <span>
            {lang === "en" ? "Chord" : "Accord"} {round + 1} / {total}
          </span>
          <span className="text-sage">{t("ui.score")} {score}</span>
        </div>
        <h2 className="mb-1 font-display text-xl">
          3 {t("ch.target")} {nn[target.root]} {qLabel(target.q)}
        </h2>
        <p className="mb-4 text-sm text-subtle">{picked.length} / 3</p>
        <Fretboard activeCells={picked} onCellClick={click} highlight={{ rootIndex: -1, steps: [] }} />
        {fb && (
          <div
            className={cn(
              "mt-4 flex items-center justify-between rounded-md border px-4 py-3 text-sm",
              fb === "ok" ? "border-sage bg-sage-dim text-sage" : "border-danger bg-danger-dim text-danger",
            )}
          >
            <span>{fb === "ok" ? t("iv.exact") : `${t("ch.degrees")} : ${target.q.degrees}`}</span>
            <Button
              variant="outline"
              className="border-current text-inherit"
              onClick={() => {
                if (round + 1 >= total) {
                  onFinish(Math.round((score / total) * 100));
                  setPhase("recap");
                } else {
                  setRound((r) => r + 1);
                  newTarget();
                }
              }}
            >
              {round + 1 >= total ? t("ui.result") : t("ui.next")}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <Recap
      score={score}
      total={total}
      onRetry={() => {
        setPhase("game");
        setScore(0);
        setRound(0);
        newTarget();
      }}
      onBack={() => nav({ to: "/parcours" })}
      perfect={t("ch.perfect")}
      ok={t("ch.ok")}
    />
  );
}

function RhythmExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [tempo, setTempo] = useState(90);
  const t = useT();
  const lang = useLang();
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const [beat, setBeat] = useState(-1);
  const [rows, setRows] = useState<{ percent: number; result: { diff: number | null; verdict: string }[] } | null>(
    null,
  );
  const BEATS = 8;
  const timers = useState<number[]>([])[0];
  const expected: { current: number[] } = useState({ current: [] as number[] })[0];
  const taps: { current: number[] } = useState({ current: [] as number[] })[0];
  const nav = useNavigate();

  // Quitter la leçon en cours de run ne doit ni scorer ni créditer après coup.
  useEffect(() => () => timers.splice(0).forEach((t) => window.clearTimeout(t)), [timers]);

  const start = async () => {
    const ctx = await resumeAudio();
    timers.splice(0).forEach((t) => clearTimeout(t));
    setPhase("run");
    setRows(null);
    setBeat(-1);
    const beatSec = 60 / tempo;
    const lead = 0.35;
    const startPerf = performance.now() + lead * 1000;
    expected.current = Array.from({ length: BEATS }, (_, i) => startPerf + i * beatSec * 1000);
    taps.current = [];
    // Clics via minuteurs (annulables si on quitte) plutôt qu'en bloc à
    // temps absolus AudioContext (impossible à interrompre).
    expected.current.forEach((t, i) => {
      timers.push(
        window.setTimeout(() => playClick(ctx, ctx.currentTime, i % 4 === 0), Math.max(0, t - performance.now())),
      );
    });
    expected.current.forEach((t, i) => {
      timers.push(window.setTimeout(() => setBeat(i), Math.max(0, t - performance.now())));
    });
    timers.push(
      window.setTimeout(() => {
        setBeat(-1);
        const tapObjs = taps.current.map((t) => ({ time: t, used: false }));
        const result = expected.current.map((t) => {
          let best = -1;
          let bestDiff = Infinity;
          tapObjs.forEach((tap, idx) => {
            if (tap.used) return;
            const d = Math.abs(tap.time - t);
            if (d < bestDiff) {
              bestDiff = d;
              best = idx;
            }
          });
          if (best !== -1 && bestDiff <= 220) {
            tapObjs[best].used = true;
            return { diff: Math.round(bestDiff), verdict: bestDiff <= 60 ? "parfait" : bestDiff <= 150 ? "bien" : "tard" };
          }
          return { diff: null, verdict: "manque" };
        });
        const points = result.reduce((s, r) => s + (r.verdict === "parfait" ? 2 : r.verdict === "bien" ? 1 : 0), 0);
        const percent = Math.round((points / (BEATS * 2)) * 100);
        setRows({ result, percent });
        onFinish(percent);
        setPhase("done");
      }, expected.current[BEATS - 1] - performance.now() + 700),
    );
  };

  return (
    <>
      <p className="mb-5 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("rh.intro")}
      </p>
      <div className="mb-8 grid grid-cols-4 gap-2 rounded-md border border-line bg-surface p-4">
        {NOTE_VALUES.map((n) => (
          <div key={n.id} className="text-center">
            <NoteSymbol type={n.id} />
            <p className="mt-1 mb-0 text-sm">{lang === "en" ? n.labelEn : n.label}</p>
            <p className="m-0 font-mono text-xs text-subtle">{n.beats} {t("rh.beats")}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-1 font-display text-lg">{t("rh.title")}</h2>
      <p className="mb-4 text-sm text-subtle">{t("rh.sub")}</p>
      {phase !== "run" && (
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-xs text-subtle">60</span>
          <input
            type="range"
            min={60}
            max={140}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="flex-1"
          />
          <span className="font-mono text-xs text-gold">{tempo} bpm</span>
        </div>
      )}
      <div className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={() => (phase === "run" ? taps.current.push(performance.now()) : start())}
          className={cn(
            "size-36 rounded-full border-2 text-sm font-medium",
            beat >= 0 ? "border-gold bg-raised" : "border-line bg-surface",
          )}
        >
          {phase === "run" ? t("rh.tap") : phase === "done" ? t("rh.restart") : t("rh.start")}
        </button>
        {phase === "run" && (
          <div className="flex gap-1.5">
            {Array.from({ length: BEATS }).map((_, i) => (
              <span key={i} className={cn("size-2 rounded-full", i <= beat ? "bg-gold" : "bg-line")} />
            ))}
          </div>
        )}
        {phase === "done" && rows && (
          <div className="w-full">
            <p className="m-0 text-center font-display text-2xl">{rows.percent} %</p>
            <p className="mb-4 text-center text-sm text-subtle">
              {rows.percent >= 80 ? t("rh.great") : t("rh.advice")}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {rows.result.map((r, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-sm px-2 py-1 font-mono text-[11px]",
                    r.verdict === "parfait" && "bg-sage-dim text-sage",
                    r.verdict === "bien" && "bg-raised text-gold",
                    (r.verdict === "tard" || r.verdict === "manque") && "bg-danger-dim text-danger",
                  )}
                >
                  {r.diff == null ? "—" : `${r.diff}ms`}
                </span>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => nav({ to: "/parcours" })}>{t("ui.continue")}</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function MancheExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 12));
  const [fb, setFb] = useState<"ok" | "ko" | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const total = 6;
  const t = useT();
  const nn = useNN();
  const nav = useNavigate();

  if (done) {
    return (
      <Recap
        score={score}
        total={total}
        onRetry={() => {
          setScore(0);
          setRound(0);
          setTarget(Math.floor(Math.random() * 12));
          setFb(null);
          setDone(false);
        }}
        onBack={() => nav({ to: "/parcours" })}
        perfect={t("nk.good")}
        ok={t("lesson.retry60")}
      />
    );
  }

  return (
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("nk.intro")}
      </p>
      <p className="mb-2 font-mono text-xs text-subtle">
        {round + 1} / {total} · {t("ui.score").toLowerCase()} {score}
      </p>
      <h2 className="mb-4 font-display text-xl">{t("nk.find")} {nn[target]}</h2>
      <Fretboard
        hear
        highlight={{ rootIndex: fb ? target : -1, steps: fb ? [0] : [] }}
        onCellClick={(s, f) => {
          if (fb) return;
          const ok = noteAt(s, f) === target;
          setFb(ok ? "ok" : "ko");
          if (ok) setScore((x) => x + 1);
        }}
      />
      {fb && (
        <div className="mt-4 flex justify-between">
          <span className={fb === "ok" ? "text-sage" : "text-danger"}>{fb === "ok" ? t("nk.good") : `${t("nk.was")} ${nn[target]}.`}</span>
          <Button
            onClick={() => {
              if (round + 1 >= total) {
                onFinish(Math.round(((score) / total) * 100));
                setDone(true);
              } else {
                setRound((r) => r + 1);
                setTarget(Math.floor(Math.random() * 12));
                setFb(null);
              }
            }}
          >
            {round + 1 >= total ? t("ui.finishLesson") : t("ui.next")}
          </Button>
        </div>
      )}
    </>
  );
}

/** Explorateur suivi d'un quiz de validation (60 % pour valider). */
function ExploreThenQuiz({
  quizId,
  onFinish,
  children,
}: {
  quizId: string;
  onFinish: (p: number) => void;
  children: ReactNode;
}) {
  const [step, setStep] = useState<"explore" | "quiz" | "recap">("explore");
  const [pct, setPct] = useState(0);
  // Valider exige au moins une interaction avec l'explorateur (choisir une
  // tonique, cliquer le manche, écouter un accord) : pas de validation
  // sans avoir touché au contenu.
  const [touched, setTouched] = useState(false);
  const t = useT();
  const lang = useLang();
  const nav = useNavigate();
  if (step === "explore") {
    return (
      <>
        <div onClickCapture={() => setTouched(true)}>{children}</div>
        <Button className="mt-6" onClick={() => setStep("quiz")} disabled={!touched}>
          {t("ui.validateQuiz")}
        </Button>
        {!touched && (
          <p className="mt-2 text-xs text-subtle">
            {lang === "en" ? "Explore first: pick a root, tap the neck, hear a chord." : "Explore d'abord : choisis une tonique, touche le manche, écoute un accord."}
          </p>
        )}
      </>
    );
  }
  if (step === "quiz") {
    return (
      <QuizBlock
        questions={quizFor(lang, quizId)}
        onDone={(p) => {
          setPct(p);
          onFinish(p);
          setStep("recap");
        }}
      />
    );
  }
  return (
    <Recap
      score={pct}
      total={0}
      onRetry={() => setStep("quiz")}
      onBack={() => nav({ to: "/parcours" })}
      perfect={t("ui.validated")}
      ok={t("ui.below60")}
    />
  );
}

function MajorScaleExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(0);
  const t = useT();
  const nn = useNN();
  const steps = [0, 2, 4, 5, 7, 9, 11];
  // Banque "gamme-maj" dédiée (motifs, I–IV–V) : pas le quiz général des gammes.
  return (
    <ExploreThenQuiz quizId="gamme-maj" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("mj.intro")}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {nn.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <p className="mb-3 font-mono text-xs text-subtle">
        {steps.map((s) => nn[(root + s) % 12]).join(" · ")}
      </p>
      <div className="mb-4">
        <Fretboard highlight={{ rootIndex: root, steps }} hear />
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        {[0, 3, 4].map((d) => {
          const ch = degreeChord(root, "majeure", d);
          return (
            <Button
              key={d}
              variant="outline"
              onClick={async () => {
                await resumeAudio();
                playChordNow(root, ch.rootOffset, ch.quality.formula);
              }}
            >
              {ch.numeral} {nn[ch.rootNoteIndex]}
            </Button>
          );
        })}
      </div>
    </ExploreThenQuiz>
  );
}

function ScalesExplorer({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(9);
  const [sid, setSid] = useState<"majeure" | "mineure" | "harm-min" | "mel-min">("mineure");
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const scale = SCALES.find((s) => s.id === sid)!;
  return (
    <ExploreThenQuiz quizId="gammes" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("sc.intro")}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {nn.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["majeure", "mineure", "harm-min", "mel-min"] as const).map((id) => (
          <Chip key={id} tone="sage" active={sid === id} onClick={() => setSid(id)}>
            {lang === "en" ? SCALES.find((s) => s.id === id)!.labelEn : SCALES.find((s) => s.id === id)!.label}
          </Chip>
        ))}
      </div>
      <Fretboard highlight={{ rootIndex: root, steps: scale.steps }} hear />
    </ExploreThenQuiz>
  );
}

function ModesExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [deg, setDeg] = useState(0);
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const parent = 0;
  const modeRoot = (parent + [0, 2, 4, 5, 7, 9, 11][deg]) % 12;
  const steps = [0, 2, 4, 5, 7, 9, 11].map((s) => (s - [0, 2, 4, 5, 7, 9, 11][deg] + 12) % 12).sort((a, b) => a - b);
  return (
    <ExploreThenQuiz quizId="modes" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("mo.intro")}
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {MODES_MAJOR.map((m, i) => (
          <Chip key={m.name} active={i === deg} onClick={() => setDeg(i)}>
            {lang === "en" ? m.nameEn : m.name}
          </Chip>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">
        {nn[modeRoot]} {lang === "en" ? MODES_MAJOR[deg].nameEn : MODES_MAJOR[deg].name} — {lang === "en" ? MODES_MAJOR[deg].colorEn : MODES_MAJOR[deg].color}
      </p>
      <Fretboard highlight={{ rootIndex: modeRoot, steps }} hear />
    </ExploreThenQuiz>
  );
}

function PentaExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(4);
  const [sid, setSid] = useState<"penta-min" | "penta-maj" | "blues">("penta-min");
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const scale = SCALES.find((s) => s.id === sid)!;
  return (
    <ExploreThenQuiz quizId="pentas" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("pe.intro")}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {nn.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["penta-min", "penta-maj", "blues"] as const).map((id) => (
          <Chip key={id} tone="sage" active={sid === id} onClick={() => setSid(id)}>
            {lang === "en" ? SCALES.find((s) => s.id === id)!.labelEn : SCALES.find((s) => s.id === id)!.label}
          </Chip>
        ))}
      </div>
      <Fretboard highlight={{ rootIndex: root, steps: scale.steps }} hear />
    </ExploreThenQuiz>
  );
}

function CadenceExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [key, setKey] = useState(0);
  const t = useT();
  const nn = useNN();
  const playProg = async (degrees: number[]) => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    degrees.forEach((d, i) => {
      const ch = degreeChord(key, "majeure", d);
      ch.quality.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(key, ch.rootOffset + iv), now + i * 0.85, 0.8, 0.12);
      });
    });
  };
  return (
    <ExploreThenQuiz quizId="cadences" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("ca.intro")}
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {nn.map((n, i) => (
          <Chip key={n} active={i === key} onClick={() => setKey(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {PROGRESSION_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => playProg(p.degrees)}
            className="rounded-md border border-line bg-surface px-4 py-3 text-left text-sm hover:border-gold"
          >
            {p.label}
          </button>
        ))}
      </div>
    </ExploreThenQuiz>
  );
}

function ExoticExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(0);
  const [sid, setSid] = useState<"whole" | "hw-dim" | "harm-min">("whole");
  const lang = useLang();
  const nn = useNN();
  const scale = SCALES.find((s) => s.id === sid)!;
  // Banque "modes-exo" dédiée (par tons, diminuée, mineure harmonique).
  return (
    <ExploreThenQuiz quizId="modes-exo" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {lang === "en"
          ? "Whole-tone, diminished and harmonic minor: three palettes beyond everyday major/minor."
          : "Par tons, diminuée et mineure harmonique : trois palettes hors du majeur/mineur quotidien."}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {nn.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["whole", "hw-dim", "harm-min"] as const).map((id) => (
          <Chip key={id} tone="sage" active={sid === id} onClick={() => setSid(id)}>
            {lang === "en" ? SCALES.find((s) => s.id === id)!.labelEn : SCALES.find((s) => s.id === id)!.label}
          </Chip>
        ))}
      </div>
      <Fretboard highlight={{ rootIndex: root, steps: scale.steps }} hear />
    </ExploreThenQuiz>
  );
}

function ReharmoExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const key = 0;
  const lang = useLang();
  const nn = useNN();
  const play = async (useSub: boolean) => {
    await resumeAudio();
    const prog = useSub ? [1, 4, 0] : [1, 4, 0];
    // ii V I vs ii bII7 I — tritone of V (G7) is Db7, offset 1
    const ctx = getAudioContext();
    const now = ctx.currentTime + 0.05;
    const seq = useSub
      ? [
          degreeChord(key, "majeure", 1),
          { rootOffset: 1, quality: { formula: [0, 4, 7, 10] as number[] } },
          degreeChord(key, "majeure", 0),
        ]
      : [
          degreeChord(key, "majeure", 1),
          degreeChord(key, "majeure", 4),
          degreeChord(key, "majeure", 0),
        ];
    seq.forEach((ch, i) => {
      ch.quality.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(key, ch.rootOffset + iv), now + i * 0.9, 0.85, 0.12);
      });
    });
    void prog;
  };
  return (
    <ExploreThenQuiz quizId="reharmo" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {lang === "en"
          ? `In ${nn[0]}, V7 is ${nn[7]}7. A tritone away: D♭7. Both lead home. Hear the diatonic version, then the substitution.`
          : `En ${nn[0]}, le V7 est ${nn[7]}7. Un triton plus loin : Ré♭7. Les deux mènent à ${nn[0]}. Écoute la version diatonique, puis la substitution.`}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => play(false)}>
          ii – V – I
        </Button>
        <Button variant="outline" onClick={() => play(true)}>
          ii – ♭II7 – I
        </Button>
      </div>
    </ExploreThenQuiz>
  );
}

function VoicingsExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(0);
  const [qid, setQid] = useState<(typeof CHORD_QUALITIES)[number]["id"]>("maj");
  const [inv, setInv] = useState(0);
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const quality = CHORD_QUALITIES.find((q) => q.id === qid)!;
  const voicing = inversionVoicing(quality.formula, inv);
  const bassNote = nn[(root + voicing[0]) % 12];
  const qName = (lang === "en" ? quality.labelEn : quality.label).toLowerCase();

  const playVoicing = async () => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    voicing.forEach((iv, i) => {
      playTone(ctx, freqForOffset(root, iv), now + i * 0.12, 0.9, 0.14);
    });
    playTone(ctx, freqForOffset(root, voicing[0] - 12), now, 1.1, 0.18);
  };

  return (
    <ExploreThenQuiz quizId="voicings" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("vo.intro")}
      </p>
      <div className="mb-3 flex flex-wrap gap-6">
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("ch.root")}</p>
          <div className="flex max-w-xs flex-wrap gap-1.5">
            {nn.map((n, i) => (
              <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("vo.quality")}</p>
          <div className="flex flex-wrap gap-1.5">
            {CHORD_QUALITIES.filter((q) => q.formula.length === 3).map((q) => (
              <Chip key={q.id} tone="sage" active={q.id === qid} onClick={() => setQid(q.id)}>
                {lang === "en" ? q.labelEn : q.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {INVERSIONS.map((v) => (
          <Chip key={v.id} active={inv === v.id} onClick={() => setInv(v.id)}>
            {lang === "en" ? v.labelEn : v.label}
          </Chip>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">
        {nn[root]} {qName} · {lang === "en" ? INVERSIONS[inv].labelEn : INVERSIONS[inv].label} · {t("vo.bass")} : {bassNote} · {lang === "en" ? INVERSIONS[inv].explainEn : INVERSIONS[inv].explain}
      </p>
      <div className="mb-3">
        <Fretboard highlight={{ rootIndex: root, steps: quality.formula }} hear />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={playVoicing}>
          {t("vo.hear")}
        </Button>
      </div>
      <div className="mb-2 grid gap-2 sm:grid-cols-2">
        {CAGED.map((c) => (
          <div key={c.id} className="rounded-md border border-line bg-surface p-3">
            <p className="m-0 font-mono text-xs text-gold">
              {c.id} · {c.label}
            </p>
            <p className="m-0 font-mono text-xs text-muted">{c.frets}</p>
            <p className="mt-1 mb-0 text-xs text-subtle">{lang === "en" ? c.explainEn : c.explain}</p>
          </div>
        ))}
      </div>
    </ExploreThenQuiz>
  );
}

function AnalyseExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState<string | null>(null);

  async function playDiatonicSeq(degrees: number[]) {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    degrees.forEach((d, i) => {
      const ch = degreeChord(0, "majeure", d);
      ch.quality.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(0, ch.rootOffset + iv), now + i * 0.7, 0.65, 0.1);
      });
    });
  }

  async function playCustomSeq(chords: { root: number; formula: readonly number[] }[], keyRoot: number) {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    chords.forEach((ch, i) => {
      ch.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(keyRoot, ch.root + iv), now + i * 0.8, 0.75, 0.1);
      });
    });
  }

  return (
    <ExploreThenQuiz quizId="analyse" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {lang === "en"
          ? "Three famous grids, dissected: listen, reveal the degrees, read the trick."
          : "Trois grilles célèbres, décortiquées : écoute, révèle les degrés, lis l'astuce."}
      </p>
      <div className="grid gap-3">
        <AnalysisCard
          id="pachelbel"
          title="Pachelbel – Canon"
          numerals="I – V – vi – iii – IV – I – IV – V"
          open={open}
          setOpen={setOpen}
          analysis={t("an.pachelbel")}
          onHear={() => playDiatonicSeq([0, 4, 5, 2, 3, 0, 3, 4])}
        />
        <AnalysisCard
          id="creep"
          title={lang === "en" ? "Radiohead – Creep (G)" : "Radiohead – Creep (Sol)"}
          numerals="I – III – IV – iv"
          open={open}
          setOpen={setOpen}
          analysis={t("an.creep")}
          onHear={() => playCustomSeq([
            { root: 7, formula: [0, 4, 7] },
            { root: 11, formula: [0, 4, 7] },
            { root: 0, formula: [0, 4, 7] },
            { root: 0, formula: [0, 3, 7] },
          ], 0)}
        />
        <AnalysisCard
          id="blues"
          title={lang === "en" ? "A blues – 12 bars" : "Blues en La – 12 mesures"}
          numerals="I7 · I7 · IV7 · I7 · V7 · IV7 · I7 · V7"
          open={open}
          setOpen={setOpen}
          analysis={t("an.blues")}
          onHear={() => playCustomSeq([0, 0, 5, 0, 7, 5, 0, 7].map((r) => ({ root: 9 + r, formula: [0, 4, 7, 10] })), 9)}
        />
      </div>
    </ExploreThenQuiz>
  );
}

function AnalysisCard({
  id, title, numerals, open, setOpen, analysis, onHear,
}: {
  id: string;
  title: string;
  numerals: string;
  open: string | null;
  setOpen: (v: string | null) => void;
  analysis: string;
  onHear: () => void;
}) {
  const t = useT();
  const isOpen = open === id;
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="m-0 font-display text-lg">{title}</p>
        <span className="font-mono text-xs text-gold">{numerals}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" onClick={onHear}>
          {t("an.hear")}
        </Button>
        <Button variant="outline" onClick={() => setOpen(isOpen ? null : id)}>
          {t("an.read")}
        </Button>
      </div>
      {isOpen && <p className="mt-3 mb-0 text-sm leading-relaxed text-muted">{analysis}</p>}
    </div>
  );
}

function SecondairesExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const t = useT();
  const key = 0;

  const playSeq = async (chords: { rootOffset: number; formula?: readonly number[]; quality?: { formula: readonly number[] } }[]) => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    chords.forEach((ch, i) => {
      const formula = ch.formula ?? ch.quality!.formula;
      formula.forEach((iv) => {
        playTone(ctx, freqForOffset(key, ch.rootOffset + iv), now + i * 0.85, 0.8, 0.11);
      });
    });
  };

  const diat = [1, 4, 0].map((d) => degreeChord(key, "majeure", d));
  const withSec = [
    { rootOffset: 9, formula: [0, 4, 7, 10] as readonly number[] },
    degreeChord(key, "majeure", 1),
    degreeChord(key, "majeure", 4),
    degreeChord(key, "majeure", 0),
  ];
  const modal = [
    { rootOffset: 5, formula: [0, 3, 7] as readonly number[] },
    degreeChord(key, "majeure", 0),
  ];

  return (
    <ExploreThenQuiz quizId="secondaires" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">{t("se.intro")}</p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => playSeq(diat)} className="rounded-md border border-line bg-surface px-4 py-3 text-left text-sm hover:border-gold">
          {t("se.diat")}
        </button>
        <button type="button" onClick={() => playSeq(withSec)} className="rounded-md border border-line bg-surface px-4 py-3 text-left text-sm hover:border-gold">
          {t("se.sec")}
        </button>
        <button type="button" onClick={() => playSeq(modal)} className="rounded-md border border-line bg-surface px-4 py-3 text-left text-sm hover:border-gold">
          {t("se.modal")}
        </button>
      </div>
    </ExploreThenQuiz>
  );
}

function VoixExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const t = useT();

  const play = async (smooth: boolean) => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    const firstVoicing = smooth ? [7, 12, 16] : [0, 4, 7];
    const second = [7, 11, 14];
    [firstVoicing, second].forEach((chord, i) => {
      chord.forEach((iv) => {
        playTone(ctx, freqForOffset(0, iv), now + i * 1.1, 1.0, 0.13);
      });
    });
  };

  return (
    <ExploreThenQuiz quizId="voix" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">{t("vx.intro")}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => play(false)}>
          {t("vx.jumpy")}
        </Button>
        <Button variant="outline" onClick={() => play(true)}>
          {t("vx.smooth")}
        </Button>
      </div>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        {t("vx.rule")}
      </p>
    </ExploreThenQuiz>
  );
}

function MetriquesExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const t = useT();
  return (
    <ExploreThenQuiz quizId="metriques" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">{t("me.intro")}</p>
      <OddMeterTap beats={5} groups={[3, 2]} />
      <div className="mt-6">
        <OddMeterTap beats={7} groups={[2, 2, 3]} />
      </div>
    </ExploreThenQuiz>
  );
}

function OddMeterTap({ beats, groups }: { beats: number; groups: number[] }) {
  const t = useT();
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const [beat, setBeat] = useState(-1);
  const [pct, setPct] = useState<number | null>(null);
  const timers = useState<number[]>([])[0];
  const expected: { current: number[] } = useState({ current: [] as number[] })[0];
  const taps: { current: number[] } = useState({ current: [] as number[] })[0];
  // Quitter en cours de run : pas de setState ni de onFinish après démontage.
  useEffect(() => () => timers.splice(0).forEach((tm) => window.clearTimeout(tm)), [timers]);
  const groupOf = (i: number) => {
    let acc = 0;
    for (let g = 0; g < groups.length; g++) {
      acc += groups[g];
      if (i < acc) return g;
    }
    return 0;
  };
  // Départs de groupes : ex. [3,2] → [0,3]. Le temps 1 (downbeat)
  // est toujours accentué (l'ancien calcul donnait [3,5]).
  const groupStarts: number[] = [];
  groups.reduce((sum, g) => {
    groupStarts.push(sum);
    return sum + g;
  }, 0);

  const start = async () => {
    const ctx = await resumeAudio();
    timers.splice(0).forEach((tm) => clearTimeout(tm));
    setPhase("run");
    setPct(null);
    setBeat(-1);
    const beatSec = 0.55;
    const lead = 0.4;
    const startPerf = performance.now() + lead * 1000;
    expected.current = Array.from({ length: beats }, (_, i) => startPerf + i * beatSec * 1000);
    taps.current = [];
    // Clics via minuteurs annulables (cf. RhythmExercise) : quitter en
    // cours de run coupe le métronome au lieu de le laisser finir.
    expected.current.forEach((tm, i) => {
      timers.push(
        window.setTimeout(() => playClick(ctx, ctx.currentTime, groupStarts.includes(i)), Math.max(0, tm - performance.now())),
      );
    });
    expected.current.forEach((tm, i) => {
      timers.push(window.setTimeout(() => setBeat(i), Math.max(0, tm - performance.now())));
    });
    timers.push(
      window.setTimeout(() => {
        setBeat(-1);
        const tapObjs = taps.current.map((tm) => ({ time: tm, used: false }));
        let points = 0;
        expected.current.forEach((tm) => {
          let best = -1;
          let bestDiff = Infinity;
          tapObjs.forEach((tap, idx) => {
            if (tap.used) return;
            const d = Math.abs(tap.time - tm);
            if (d < bestDiff) {
              bestDiff = d;
              best = idx;
            }
          });
          if (best !== -1 && bestDiff <= 240) {
            tapObjs[best].used = true;
            points += bestDiff <= 70 ? 2 : bestDiff <= 160 ? 1 : 0;
          }
        });
        setPct(Math.round((points / (beats * 2)) * 100));
        setPhase("done");
      }, expected.current[beats - 1] - performance.now() + 700),
    );
  };

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <p className="mb-1 font-mono text-xs text-gold">
        {beats}/{beats === 5 ? "4" : "8"} · {groups.join("+")}
      </p>
      {phase === "run" && (
        <div className="mb-3 flex gap-1.5">
          {Array.from({ length: beats }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "flex h-7 flex-1 items-center justify-center rounded-sm font-mono text-[11px]",
                i <= beat ? "bg-gold text-accent-fg" : "bg-raised text-subtle",
              )}
            >
              {groupOf(i) + 1}
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => (phase === "run" ? taps.current.push(performance.now()) : start())}
        className={cn(
          "w-full rounded-md border-2 py-4 text-sm font-medium",
          beat >= 0 ? "border-gold bg-raised" : "border-line bg-bg",
        )}
      >
        {phase === "run" ? t("me.tap") : phase === "done" ? t("me.again") : t("me.start")}
      </button>
      {phase === "done" && pct != null && (
        <p className="m-0 mt-3 text-center font-display text-xl">{pct} %</p>
      )}
    </div>
  );
}

function MelodyMini({ onFinish }: { onFinish: (p: number) => void }) {
  const t = useT();
  return (
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("melody.intro")}
      </p>
      {/* requireSave : pas de validation sur une grille vide. */}
      <StudioEmbed requireSave onSaved={() => onFinish(100)} />
    </>
  );
}

function GenreMini({ onFinish }: { onFinish: (p: number) => void }) {
  const lang = useLang();
  return (
    <>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {GENRES.map((g) => (
          <div key={g.id} className="rounded-md border border-line bg-surface p-4">
            <p className="m-0 font-display text-lg">{lang === "en" ? g.labelEn : g.label}</p>
            <p className="mt-1 mb-0 text-sm leading-relaxed text-muted">{lang === "en" ? g.codesEn : g.codes}</p>
          </div>
        ))}
      </div>
      {/* requireSave : pas de validation sur une grille vide. */}
      <StudioEmbed requireSave onSaved={() => onFinish(100)} />
    </>
  );
}

function ProjetMini({ onFinish }: { onFinish: (p: number) => void }) {
  const t = useT();
  return (
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("st.projetHint")}
      </p>
      <StudioEmbed requireSave onSaved={() => onFinish(100)} />
    </>
  );
}

function StudioEmbed({ onSaved, requireSave }: { onSaved: () => void; requireSave?: boolean }) {
  return <CompositionInner onSaved={onSaved} compact requireSave={requireSave} />;
}

export function CompositionInner({
  onSaved,
  compact,
  requireSave,
}: {
  onSaved?: () => void;
  compact?: boolean;
  requireSave?: boolean;
}) {
  const [keyRoot, setKeyRoot] = useState(0);
  const [mode, setMode] = useState<ModeKey>("majeure");
  const [progression, setProgression] = useState<number[]>([0, 4, 5, 3]);
  const [playing, setPlaying] = useState(-1);
  const [melody, setMelody] = useState<(number | null)[]>(Array(8).fill(null));
  const [genre, setGenre] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const savePiece = useProgress((s) => s.savePiece);
  const degrees = Array.from({ length: 7 }, (_, i) => degreeChord(keyRoot, mode, i));
  const scaleSteps = mode === "majeure" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const suggestions = suggestNextDegrees(progression[progression.length - 1], mode);
  // Garde anti-chevauchement : réappuyer sur Écouter relance au lieu
  // d'empiler deux grilles ; tout est annulé au démontage.
  const playTimers = useRef<number[]>([]);
  const alive = useRef(true);
  // Second clic sur Écouter pendant la lecture = ignoré (pas de grille
  // empilée par-dessus) ; la lecture en cours va au bout.
  const playingRef = useRef(false);
  useEffect(() => {
    alive.current = true;
    const timers = playTimers.current;
    return () => {
      alive.current = false;
      playingRef.current = false;
      timers.splice(0).forEach((tm) => window.clearTimeout(tm));
    };
  }, []);

  const playProgression = async () => {
    if (!progression.length || playingRef.current) return;
    playTimers.current.splice(0).forEach((tm) => window.clearTimeout(tm));
    const ctx = await resumeAudio();
    if (!alive.current) return;
    playingRef.current = true;
    const dur = 0.85;
    const now = ctx.currentTime + 0.08;
    progression.forEach((d, i) => {
      const ch = degrees[d];
      ch.quality.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(keyRoot, ch.rootOffset + iv), now + i * dur, dur * 0.95, 0.1);
      });
      const m = melody[i];
      if (m != null) {
        playTone(ctx, freqForOffset(keyRoot, scaleSteps[m] + 12), now + i * dur, dur * 0.9, 0.16);
      }
      playTimers.current.push(window.setTimeout(() => {
        if (alive.current) setPlaying(i);
      }, i * dur * 1000));
    });
    playTimers.current.push(window.setTimeout(() => {
      if (alive.current) setPlaying(-1);
      playingRef.current = false;
    }, progression.length * dur * 1000));
  };

  /** Harmonisation auto : 1 note de l'accord par temps (fondamentale, tierce, quinte…). */
  const harmonize = () => {
    const m = Array<(number | null)>(8).fill(null);
    progression.forEach((d, i) => {
      if (i >= 8) return;
      m[i] = d % 7;
    });
    setMelody(m);
  };

  const exportMidi = () => {
    const bytes = buildMidiFile({ keyRoot, mode, progression, melody });
    downloadBytes(bytes, `${(title || "morceau").replace(/\s+/g, "-").toLowerCase()}.mid`, "audio/midi");
  };

  const exportText = () => {
    const g = genre ? GENRES.find((x) => x.id === genre) : undefined;
    const lines = [
      `${title || t("st.untitled")} — ${nn[keyRoot]} ${mode === "majeure" ? (lang === "en" ? "major" : "majeure") : lang === "en" ? "minor" : "mineure"}${g ? ` · ${lang === "en" ? g.labelEn : g.label}` : ""}`,
      `${lang === "en" ? "Progression" : "Grille"} : ${progression.map((d) => `${degrees[d].numeral} (${nn[degrees[d].rootNoteIndex]}${degrees[d].quality.suffix})`).join(" – ")}`,
      `${lang === "en" ? "Melody (degrees)" : "Mélodie (degrés)"} : ${melody.map((v) => (v == null ? "–" : String(v + 1))).join(" ")}`,
      "",
      renderTabText(keyRoot, mode, progression, melody),
    ];
    downloadBytes(new TextEncoder().encode(lines.join("\n")), `${(title || "morceau").replace(/\s+/g, "-").toLowerCase()}.txt`, "text/plain");
  };

  const tabText = progression.length ? renderTabText(keyRoot, mode, progression, melody) : "";

  return (
    <div>
      {!compact && (
        <p className="mb-5 max-w-xl text-sm leading-relaxed text-muted">
          {t("st.sub")}
        </p>
      )}
      <div className="mb-5 flex flex-wrap gap-6">
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.key")}</p>
          <div className="flex max-w-xs flex-wrap gap-1.5">
            {nn.map((n, i) => (
              <Chip key={n} active={i === keyRoot} onClick={() => setKeyRoot(i)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.mode")}</p>
          <div className="flex gap-1.5">
            {(["majeure", "mineure"] as const).map((m) => (
              <Chip key={m} tone="sage" active={m === mode} onClick={() => setMode(m)}>
                {m === "majeure" ? (lang === "en" ? "major" : "majeure") : lang === "en" ? "minor" : "mineure"}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.genre")}</p>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {GENRES.map((g) => (
          <Chip
            key={g.id}
            active={genre === g.id}
            onClick={() => {
              setGenre(g.id);
              setMode(g.mode);
              setProgression([...g.progression]);
            }}
          >
            {lang === "en" ? g.labelEn : g.label}
          </Chip>
        ))}
      </div>
      <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.degrees")}</p>
      <div className="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {degrees.map((ch, i) => (
          <button
            key={i}
            type="button"
            onClick={() => progression.length < 8 && setProgression((p) => [...p, i])}
            className="rounded-md border border-line bg-surface px-2 py-3 text-center"
          >
            <p className="m-0 font-display text-lg text-gold">{ch.numeral}</p>
            <p className="m-0 font-mono text-xs text-muted">
              {nn[ch.rootNoteIndex]}
              {ch.quality.suffix}
            </p>
          </button>
        ))}
      </div>
      <div className="mb-5 rounded-md border border-line bg-raised p-4">
        <p className="mb-3 font-mono text-[11px] text-subtle">{t("st.prog")}</p>
        {progression.length === 0 ? (
          <p className="text-sm text-subtle">{t("st.addChords")}</p>
        ) : (
          <div className="mb-3 flex flex-wrap gap-2">
            {progression.map((d, i) => {
              const ch = degrees[d];
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-sm border px-2 py-1.5",
                    playing === i ? "border-gold bg-surface" : "border-line bg-surface",
                  )}
                >
                  <span className="font-display text-gold">{ch.numeral}</span>
                  <button type="button" className="text-subtle" onClick={() => setProgression((p) => p.filter((_, j) => j !== i))}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.melody")}</p>
        <div className="mb-4 grid grid-cols-8 gap-1">
          {melody.map((v, i) => (
            <select
              key={i}
              value={v == null ? "" : String(v)}
              onChange={(e) => {
                const n = e.target.value === "" ? null : Number(e.target.value);
                setMelody((m) => {
                  const x = [...m];
                  x[i] = n;
                  return x;
                });
              }}
              className="rounded-sm border border-line bg-bg px-1 py-2 font-mono text-xs text-fg"
            >
              <option value="">—</option>
              {scaleSteps.map((_, di) => (
                <option key={di} value={di}>
                  {di + 1}
                </option>
              ))}
            </select>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={playProgression} disabled={progression.length === 0}>
            {t("ui.listen")}
          </Button>
          <Button variant="outline" onClick={() => setProgression([])}>
            {t("st.clear")}
          </Button>
          <Button variant="outline" onClick={harmonize} disabled={progression.length === 0}>
            {t("st.harmonize")}
          </Button>
        </div>
      </div>
      <div className="mb-5 rounded-md border border-line bg-surface p-4">
        <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.assist")} {progression.length ? degrees[progression[progression.length - 1]].numeral : "…"} ?</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.degree}
              type="button"
              title={lang === "en" ? s.whyEn : s.why}
              onClick={() => progression.length < 8 && setProgression((p) => [...p, s.degree])}
              className="rounded-sm border border-line bg-bg px-3 py-2 text-left text-xs text-muted hover:border-gold hover:text-fg"
            >
              <span className="font-display text-sm text-gold">{degrees[s.degree].numeral}</span> · {lang === "en" ? s.whyEn : s.why}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5 rounded-md border border-line bg-surface p-4">
        <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.library")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PROGRESSION_LIBRARY.map((p) => (
            <button
              key={p.id}
              type="button"
              title={lang === "en" ? p.analysisEn : p.analysis}
              onClick={() => {
                setProgression([...p.degrees]);
                setMode(p.mode);
              }}
              className="rounded-sm border border-line bg-bg px-3 py-2 text-left hover:border-gold"
            >
              <span className="text-sm text-fg">{p.label}</span>{" "}
              <span className="font-mono text-xs text-gold">{p.numerals}</span>
              <span className="mt-1 block text-xs leading-relaxed text-subtle">{lang === "en" ? p.analysisEn : p.analysis}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5 flex flex-wrap gap-2 no-print">
        <Button variant="outline" onClick={exportMidi} disabled={progression.length === 0}>
          {t("st.midi")}
        </Button>
        <Button variant="outline" onClick={exportText} disabled={progression.length === 0}>
          {t("st.text")}
        </Button>
        <Button variant="outline" onClick={() => window.print()} disabled={progression.length === 0}>
          {t("st.pdf")}
        </Button>
      </div>
      {tabText && (
        <div className="mb-5 rounded-md border border-line bg-surface p-4 no-print">
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("st.tab")}</p>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted">{tabText}</pre>
        </div>
      )}
      {/* Fiche imprimable : seule visible à l'impression (voir styles.css) */}
      {progression.length > 0 && (
        <div className="print-only">
          <h1>{title || t("st.untitled")}</h1>
          <p>
            {nn[keyRoot]} {lang === "en" ? (mode === "majeure" ? "major" : "minor") : mode}
            {genre ? ` · ${(() => { const g = GENRES.find((x) => x.id === genre); return g ? (lang === "en" ? g.labelEn : g.label) : genre; })()}` : ""} — Diapason
          </p>
          <p>{lang === "en" ? "Progression" : "Grille"} : {progression.map((d) => `${degrees[d].numeral} (${nn[degrees[d].rootNoteIndex]}${degrees[d].quality.suffix})`).join(" – ")}</p>
          <pre>{tabText}</pre>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-subtle">
          {t("st.name")}
          <input
            value={title}
            placeholder={t("st.untitled")}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-fg"
          />
        </label>
        <Button
          onClick={() => {
            // savePiece dit si la pièce est nouvelle (doublon → pas de validation).
            if (savePiece({ title: title || t("st.untitled"), keyRoot, mode, progression, melody, genre })) onSaved?.();
          }}
          disabled={requireSave && progression.length < 4}
        >
          {t("st.save")}
        </Button>
      </div>
    </div>
  );
}
