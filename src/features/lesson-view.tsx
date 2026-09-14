import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Fretboard, NoteSymbol } from "@/components/fretboard";
import { BackLink, Button, Chip } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { resumeAudio, playIntervalAscending, playChordNow, playClick, getAudioContext, playTone, freqForOffset } from "@/lib/audio";
import { LESSONS, QUIZZES, lessonById } from "@/lib/curriculum";
import {
  CAGED,
  CHORD_QUALITIES,
  GENRES,
  INTERVALS,
  INVERSIONS,
  MODES_MAJOR,
  NOTES,
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
  shuffle,
  suggestNextDegrees,
  type ModeKey,
} from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function LessonView({ id }: { id: string }) {
  const lesson = lessonById(id);
  const nav = useNavigate();
  const unlocked = useProgress((s) => s.isUnlocked(id));
  const completeLesson = useProgress((s) => s.completeLesson);

  if (!lesson) {
    return (
      <Page>
        <p>Leçon introuvable.</p>
      </Page>
    );
  }

  if (!unlocked) {
    return (
      <Page>
        <BackLink onClick={() => nav({ to: "/parcours" })} label="Parcours" />
        <div className="flex items-center gap-3 text-muted">
          <Lock size={18} />
          <p>Termine la leçon précédente pour débloquer « {lesson.title} ».</p>
        </div>
      </Page>
    );
  }

  const finish = (percent: number) => completeLesson(id, percent);

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/parcours" })} label="Parcours" />
      <Title kicker={`Phase ${lesson.phase} · ${LESSONS.filter((l) => l.phase === lesson.phase).findIndex((l) => l.id === id) + 1}`} >
        {lesson.title}
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
      {id === "melodie" && <MelodyMini onFinish={finish} />}
      {id === "genres" && <GenreMini onFinish={finish} />}
      {id === "projet" && <ProjetMini onFinish={finish} />}
      {QUIZZES[id] && (
        <TheoryQuiz
          intro={lesson.intro}
          questions={QUIZZES[id]}
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
  const nav = useNavigate();
  if (phase === "intro") {
    return (
      <>
        {intro.map((p) => (
          <p key={p} className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {p}
          </p>
        ))}
        <Button onClick={() => setPhase("quiz")}>Commencer le quiz</Button>
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
      perfect="Solide. Tu peux avancer."
      ok="Relis l'intro et retente — 60 % débloque la suite."
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
  const nav = useNavigate();

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
          Un intervalle mesure la distance entre deux notes, en demi-tons. Sur une corde, c'est le nombre de cases.
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
          Commencer l'exercice
        </Button>
      </>
    );
  }

  if (phase === "quiz" && q) {
    return (
      <>
        <div className="mb-2 flex justify-between font-mono text-xs text-subtle">
          <span>
            Question {round + 1} / {total}
          </span>
          <span className="text-sage">Score {score}</span>
        </div>
        <h2 className="mb-5 font-display text-xl">
          Clique la {q.label} au-dessus du Mi grave à vide.
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
                ? "Exact."
                : `La ${q.label} est ${q.semis} case${q.semis > 1 ? "s" : ""} plus loin.`}
            </span>
            <Button variant="outline" className="border-current text-inherit" onClick={go}>
              {round + 1 >= total ? "Résultat" : "Suivant"}
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
      perfect="Les intervalles sur une corde sont automatiques."
      ok="Encore quelques passages et ce sera fluide."
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
  const nav = useNavigate();

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
          Une triade empile fondamentale, tierce et quinte. Change la tierce ou la quinte : la couleur change.
        </p>
        <div className="mb-3 flex flex-wrap gap-6">
          <div>
            <p className="mb-2 font-mono text-[11px] text-subtle">Fondamentale</p>
            <div className="flex max-w-xs flex-wrap gap-1.5">
              {NOTES.map((n, i) => (
                <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] text-subtle">Couleur</p>
            <div className="flex flex-wrap gap-1.5">
              {CHORD_QUALITIES.filter((q) => q.formula.length === 3).map((q) => (
                <Chip key={q.id} tone="sage" active={q.id === qid} onClick={() => setQid(q.id)}>
                  {q.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <p className="mb-3 font-mono text-xs text-subtle">
          {NOTES[root]} {quality.label.toLowerCase()} · {quality.degrees}
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
          Jouer : construis l'accord
        </Button>
      </>
    );
  }

  if (phase === "game" && target) {
    return (
      <>
        <div className="mb-2 flex justify-between font-mono text-xs text-subtle">
          <span>
            Accord {round + 1} / {total}
          </span>
          <span className="text-sage">Score {score}</span>
        </div>
        <h2 className="mb-1 font-display text-xl">
          3 notes pour un {NOTES[target.root]} {target.q.label.toLowerCase()}
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
            <span>{fb === "ok" ? "Exact." : `Degrés : ${target.q.degrees}`}</span>
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
              {round + 1 >= total ? "Résultat" : "Suivant"}
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
      perfect="Triades acquises."
      ok="Revois les degrés de chaque couleur."
    />
  );
}

function RhythmExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [tempo, setTempo] = useState(90);
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

  const start = async () => {
    const ctx = await resumeAudio();
    timers.splice(0).forEach((t) => clearTimeout(t));
    setPhase("run");
    setRows(null);
    setBeat(-1);
    const beatSec = 60 / tempo;
    const lead = 0.35;
    const startCtx = ctx.currentTime + lead;
    const startPerf = performance.now() + lead * 1000;
    expected.current = Array.from({ length: BEATS }, (_, i) => startPerf + i * beatSec * 1000);
    taps.current = [];
    for (let i = 0; i < BEATS; i++) playClick(ctx, startCtx + i * beatSec, i % 4 === 0);
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
        En 4/4, la ronde dure la mesure, la blanche la moitié, la noire un temps, la croche un demi-temps.
      </p>
      <div className="mb-8 grid grid-cols-4 gap-2 rounded-md border border-line bg-surface p-4">
        {NOTE_VALUES.map((n) => (
          <div key={n.id} className="text-center">
            <NoteSymbol type={n.id} />
            <p className="mt-1 mb-0 text-sm">{n.label}</p>
            <p className="m-0 font-mono text-xs text-subtle">{n.beats} t</p>
          </div>
        ))}
      </div>
      <h2 className="mb-1 font-display text-lg">Cale-toi sur le tempo</h2>
      <p className="mb-4 text-sm text-subtle">8 clics. Tape le cercle le plus près possible de chaque temps.</p>
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
          {phase === "run" ? "Tape ici" : phase === "done" ? "Recommencer" : "Démarrer"}
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
              {rows.percent >= 80 ? "Excellent sens du tempo." : "Écoute deux mesures avant de te lancer."}
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
              <Button onClick={() => nav({ to: "/parcours" })}>Continuer</Button>
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
  const total = 6;
  const nav = useNavigate();

  return (
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Clique n'importe quelle case qui porte la note demandée. Le manche entier répète les 12 sons.
      </p>
      <p className="mb-2 font-mono text-xs text-subtle">
        {round + 1} / {total} · score {score}
      </p>
      <h2 className="mb-4 font-display text-xl">Trouve un {NOTES[target]}</h2>
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
          <span className={fb === "ok" ? "text-sage" : "text-danger"}>{fb === "ok" ? "Bien vu." : `C'était ${NOTES[target]}.`}</span>
          <Button
            onClick={() => {
              if (round + 1 >= total) {
                onFinish(Math.round(((score) / total) * 100));
                nav({ to: "/parcours" });
              } else {
                setRound((r) => r + 1);
                setTarget(Math.floor(Math.random() * 12));
                setFb(null);
              }
            }}
          >
            {round + 1 >= total ? "Terminer" : "Suivant"}
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
  const nav = useNavigate();
  if (step === "explore") {
    return (
      <>
        {children}
        <Button className="mt-6" onClick={() => setStep("quiz")}>
          Valider avec le quiz
        </Button>
      </>
    );
  }
  if (step === "quiz") {
    return (
      <QuizBlock
        questions={QUIZZES[quizId]}
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
      perfect="Validé. Direction la leçon suivante."
      ok="Sous les 60 % : revois l'explorateur ci-dessus puis retente."
    />
  );
}

function MajorScaleExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(0);
  const steps = [0, 2, 4, 5, 7, 9, 11];
  return (
    <ExploreThenQuiz quizId="gamme-maj" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Tonique → T T ½ T T T ½. Les accords I, IV, V se construisent sur les 1er, 4e et 5e degrés.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {NOTES.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <p className="mb-3 font-mono text-xs text-subtle">
        {steps.map((s) => NOTES[(root + s) % 12]).join(" · ")}
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
              {ch.numeral} {NOTES[ch.rootNoteIndex]}
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
  const scale = SCALES.find((s) => s.id === sid)!;
  return (
    <ExploreThenQuiz quizId="gammes" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Compare majeure, mineure naturelle, harmonique (7e haussée) et mélodique (6e et 7e haussées).
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {NOTES.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["majeure", "mineure", "harm-min", "mel-min"] as const).map((id) => (
          <Chip key={id} tone="sage" active={sid === id} onClick={() => setSid(id)}>
            {SCALES.find((s) => s.id === id)!.label}
          </Chip>
        ))}
      </div>
      <Fretboard highlight={{ rootIndex: root, steps: scale.steps }} hear />
    </ExploreThenQuiz>
  );
}

function ModesExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [deg, setDeg] = useState(0);
  const parent = 0;
  const modeRoot = (parent + [0, 2, 4, 5, 7, 9, 11][deg]) % 12;
  const steps = [0, 2, 4, 5, 7, 9, 11].map((s) => (s - [0, 2, 4, 5, 7, 9, 11][deg] + 12) % 12).sort((a, b) => a - b);
  return (
    <ExploreThenQuiz quizId="modes" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Même notes que Do majeur, centre déplacé. Écoute la couleur de chaque mode.
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {MODES_MAJOR.map((m, i) => (
          <Chip key={m.name} active={i === deg} onClick={() => setDeg(i)}>
            {m.name}
          </Chip>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">
        {NOTES[modeRoot]} {MODES_MAJOR[deg].name} — {MODES_MAJOR[deg].color}
      </p>
      <Fretboard highlight={{ rootIndex: modeRoot, steps }} hear />
    </ExploreThenQuiz>
  );
}

function PentaExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(4);
  const [sid, setSid] = useState<"penta-min" | "penta-maj" | "blues">("penta-min");
  const scale = SCALES.find((s) => s.id === sid)!;
  return (
    <ExploreThenQuiz quizId="pentas" onFinish={onFinish}>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        La pentatonique mineure et la majeure sont relatives (trois demi-tons). La blues ajoute la ♭5.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {NOTES.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["penta-min", "penta-maj", "blues"] as const).map((id) => (
          <Chip key={id} tone="sage" active={sid === id} onClick={() => setSid(id)}>
            {SCALES.find((s) => s.id === id)!.label}
          </Chip>
        ))}
      </div>
      <Fretboard highlight={{ rootIndex: root, steps: scale.steps }} hear />
    </ExploreThenQuiz>
  );
}

function CadenceExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [key, setKey] = useState(0);
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
        Écoute les cadences dans n'importe quelle tonalité. V–I conclut, IV–I adoucit, ii–V–I est le moteur jazz.
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {NOTES.map((n, i) => (
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
  const scale = SCALES.find((s) => s.id === sid)!;
  return (
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Par tons, diminuée et mineure harmonique : trois palettes hors du majeur/mineur quotidien.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {NOTES.map((n, i) => (
          <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
            {n}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["whole", "hw-dim", "harm-min"] as const).map((id) => (
          <Chip key={id} tone="sage" active={sid === id} onClick={() => setSid(id)}>
            {SCALES.find((s) => s.id === id)!.label}
          </Chip>
        ))}
      </div>
      <Fretboard highlight={{ rootIndex: root, steps: scale.steps }} hear />
      <Button className="mt-6" onClick={() => onFinish(100)}>
        Marquer comme vue
      </Button>
      <p className="mt-3 max-w-xl text-xs leading-relaxed text-subtle">
        Leçon d'exploration : pas de quiz bloquant ici, l'examen Expert validera l'ensemble.
      </p>
    </>
  );
}

function ReharmoExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const key = 0;
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
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        En Do, le V7 est Sol7. Un triton plus loin : Ré♭7. Les deux mènent à Do. Écoute la version diatonique, puis la substitution.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => play(false)}>
          ii – V – I
        </Button>
        <Button variant="outline" onClick={() => play(true)}>
          ii – ♭II7 – I
        </Button>
      </div>
      <Button className="mt-6" onClick={() => onFinish(100)}>
        Marquer comme vue
      </Button>
    </>
  );
}

function VoicingsExercise({ onFinish }: { onFinish: (p: number) => void }) {
  const [root, setRoot] = useState(0);
  const [qid, setQid] = useState<(typeof CHORD_QUALITIES)[number]["id"]>("maj");
  const [inv, setInv] = useState(0);
  const quality = CHORD_QUALITIES.find((q) => q.id === qid)!;
  const voicing = inversionVoicing(quality.formula, inv);
  const bassNote = NOTES[(root + voicing[0]) % 12];

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
        Mêmes notes, basse différente : écoute comment le renversement change la couleur. Puis repère les 5 formes CAGED sur le manche.
      </p>
      <div className="mb-3 flex flex-wrap gap-6">
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">Fondamentale</p>
          <div className="flex max-w-xs flex-wrap gap-1.5">
            {NOTES.map((n, i) => (
              <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">Qualité</p>
          <div className="flex flex-wrap gap-1.5">
            {CHORD_QUALITIES.filter((q) => q.formula.length === 3).map((q) => (
              <Chip key={q.id} tone="sage" active={q.id === qid} onClick={() => setQid(q.id)}>
                {q.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {INVERSIONS.map((v) => (
          <Chip key={v.id} active={inv === v.id} onClick={() => setInv(v.id)}>
            {v.label}
          </Chip>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">
        {NOTES[root]} {quality.label.toLowerCase()} · {INVERSIONS[inv].label} · basse : {bassNote} · {INVERSIONS[inv].explain}
      </p>
      <div className="mb-3">
        <Fretboard highlight={{ rootIndex: root, steps: quality.formula }} hear />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={playVoicing}>
          Écouter le voicing (arpège + basse)
        </Button>
      </div>
      <div className="mb-2 grid gap-2 sm:grid-cols-2">
        {CAGED.map((c) => (
          <div key={c.id} className="rounded-md border border-line bg-surface p-3">
            <p className="m-0 font-mono text-xs text-gold">
              {c.id} · {c.label}
            </p>
            <p className="m-0 font-mono text-xs text-muted">{c.frets}</p>
            <p className="mt-1 mb-0 text-xs text-subtle">{c.explain}</p>
          </div>
        ))}
      </div>
    </ExploreThenQuiz>
  );
}

function MelodyMini({ onFinish }: { onFinish: (p: number) => void }) {
  return (
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Ouvre le studio : pose une grille I–V–vi–IV, puis une mélodie sur les degrés de la gamme. Vise les notes de l'accord sur les temps forts.
      </p>
      <StudioEmbed onSaved={() => onFinish(100)} />
    </>
  );
}

function GenreMini({ onFinish }: { onFinish: (p: number) => void }) {
  return (
    <>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {GENRES.map((g) => (
          <div key={g.id} className="rounded-md border border-line bg-surface p-4">
            <p className="m-0 font-display text-lg">{g.label}</p>
            <p className="mt-1 mb-0 text-sm leading-relaxed text-muted">{g.codes}</p>
          </div>
        ))}
      </div>
      <StudioEmbed onSaved={() => onFinish(100)} />
    </>
  );
}

function ProjetMini({ onFinish }: { onFinish: (p: number) => void }) {
  return (
    <>
      <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Projet final : choisis un genre, une tonalité, une grille d'au moins 4 accords, une mélodie, et enregistre dans le carnet.
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
  const [title, setTitle] = useState("Sans titre");
  const savePiece = useProgress((s) => s.savePiece);
  const degrees = Array.from({ length: 7 }, (_, i) => degreeChord(keyRoot, mode, i));
  const scaleSteps = mode === "majeure" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const suggestions = suggestNextDegrees(progression[progression.length - 1], mode);

  const playProgression = async () => {
    if (!progression.length) return;
    const ctx = await resumeAudio();
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
      window.setTimeout(() => setPlaying(i), i * dur * 1000);
    });
    window.setTimeout(() => setPlaying(-1), progression.length * dur * 1000);
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
    const lines = [
      `${title || "Sans titre"} — ${NOTES[keyRoot]} ${mode}${genre ? ` · ${GENRES.find((g) => g.id === genre)?.label ?? genre}` : ""}`,
      `Grille : ${progression.map((d) => `${degrees[d].numeral} (${NOTES[degrees[d].rootNoteIndex]}${degrees[d].quality.suffix})`).join(" – ")}`,
      `Mélodie (degrés) : ${melody.map((v) => (v == null ? "–" : String(v + 1))).join(" ")}`,
    ];
    downloadBytes(new TextEncoder().encode(lines.join("\n")), `${(title || "morceau").replace(/\s+/g, "-").toLowerCase()}.txt`, "text/plain");
  };

  return (
    <div>
      {!compact && (
        <p className="mb-5 max-w-xl text-sm leading-relaxed text-muted">
          Tonalité, accords diatoniques, mélodie sur 8 temps, genres. Écoute, puis enregistre dans le carnet.
        </p>
      )}
      <div className="mb-5 flex flex-wrap gap-6">
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">Tonalité</p>
          <div className="flex max-w-xs flex-wrap gap-1.5">
            {NOTES.map((n, i) => (
              <Chip key={n} active={i === keyRoot} onClick={() => setKeyRoot(i)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">Mode</p>
          <div className="flex gap-1.5">
            {(["majeure", "mineure"] as const).map((m) => (
              <Chip key={m} tone="sage" active={m === mode} onClick={() => setMode(m)}>
                {m}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <p className="mb-2 font-mono text-[11px] text-subtle">Genre</p>
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
            {g.label}
          </Chip>
        ))}
      </div>
      <p className="mb-2 font-mono text-[11px] text-subtle">Accords diatoniques</p>
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
              {NOTES[ch.rootNoteIndex]}
              {ch.quality.suffix}
            </p>
          </button>
        ))}
      </div>
      <div className="mb-5 rounded-md border border-line bg-raised p-4">
        <p className="mb-3 font-mono text-[11px] text-subtle">Progression</p>
        {progression.length === 0 ? (
          <p className="text-sm text-subtle">Ajoute des accords.</p>
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
        <p className="mb-2 font-mono text-[11px] text-subtle">Mélodie (degré de la gamme par temps)</p>
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
            Écouter
          </Button>
          <Button variant="outline" onClick={() => setProgression([])}>
            Effacer accords
          </Button>
          <Button variant="outline" onClick={harmonize} disabled={progression.length === 0}>
            Harmoniser auto
          </Button>
        </div>
      </div>
      <div className="mb-5 rounded-md border border-line bg-surface p-4">
        <p className="mb-2 font-mono text-[11px] text-subtle">Assistant — que jouer après {progression.length ? degrees[progression[progression.length - 1]].numeral : "…"} ?</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.degree}
              type="button"
              title={s.why}
              onClick={() => progression.length < 8 && setProgression((p) => [...p, s.degree])}
              className="rounded-sm border border-line bg-bg px-3 py-2 text-left text-xs text-muted hover:border-gold hover:text-fg"
            >
              <span className="font-display text-sm text-gold">{degrees[s.degree].numeral}</span> · {s.why}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5 rounded-md border border-line bg-surface p-4">
        <p className="mb-2 font-mono text-[11px] text-subtle">Bibliothèque — 12 grilles analysées</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PROGRESSION_LIBRARY.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.analysis}
              onClick={() => {
                setProgression([...p.degrees]);
                setMode(p.mode);
              }}
              className="rounded-sm border border-line bg-bg px-3 py-2 text-left hover:border-gold"
            >
              <span className="text-sm text-fg">{p.label}</span>{" "}
              <span className="font-mono text-xs text-gold">{p.numerals}</span>
              <span className="mt-1 block text-xs leading-relaxed text-subtle">{p.analysis}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <Button variant="outline" onClick={exportMidi} disabled={progression.length === 0}>
          Export MIDI
        </Button>
        <Button variant="outline" onClick={exportText} disabled={progression.length === 0}>
          Export texte / tab
        </Button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-subtle">
          Titre
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-fg"
          />
        </label>
        <Button
          onClick={() => {
            savePiece({ title: title || "Sans titre", keyRoot, mode, progression, melody, genre });
            onSaved?.();
          }}
          disabled={requireSave && progression.length < 4}
        >
          Enregistrer dans le carnet
        </Button>
      </div>
    </div>
  );
}
