import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, ClipboardList, Play, Route as RouteIcon, Volume2 } from "lucide-react";
import { DrumPads } from "@/components/drum-pads";
import { GrooveCard } from "@/components/groove-card";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { Recap } from "@/features/quiz-block";
import { playDrum, resumeAudio } from "@/lib/audio";
import { GROOVES, GROOVE_BARS, playDemoFill, type Groove } from "@/lib/grooves";
import { shuffle } from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/batterie")({ component: BatterieLayout });

/** Route parente : le hub seul sur /batterie, <Outlet/> sur les sous-pages. */
function BatterieLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/batterie" && pathname !== "/batterie/") return <Outlet />;
  return <BatteriePage />;
}

function BatteriePage() {
  const t = useT();
  const [bpm, setBpm] = useState(100);
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);

  return (
    <Page wide>
      <Title kicker={t("bat.kicker")} lead={t("bat.lead")}>
        {t("bat.title")}
      </Title>

      <BatLearnCard completed={completed} scores={scores} />

      <h2 className="mb-1 font-display text-xl">{t("bat.pads")}</h2>
      <p className="mt-0 mb-3 text-sm text-muted">{t("bat.padsLead")}</p>
      <div className="mb-10">
        <DrumPads />
      </div>

      <h2 className="mb-1 font-display text-xl">{t("bat.grooves")}</h2>
      <p className="mt-0 mb-3 text-sm text-muted">{t("bat.groovesLead")}</p>
      <div className="mb-6 flex max-w-md items-center gap-3">
        <span className="font-mono text-xs text-subtle">{t("bat.tempo")}</span>
        <input
          type="range"
          min={80}
          max={140}
          step={2}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="flex-1"
          aria-label={t("bat.tempo")}
        />
        <span className="w-16 text-right font-mono text-xs text-gold">{bpm} BPM</span>
      </div>
      <div className="mb-10 grid gap-2 md:grid-cols-2">
        {GROOVES.map((g) => (
          <GrooveCard key={g.id} groove={g} bpm={bpm} />
        ))}
      </div>

      <h2 className="mb-1 font-display text-xl">{t("bat.game")}</h2>
      <p className="mt-0 mb-3 text-sm text-muted">{t("bat.gameLead")}</p>
      <DrumQuiz />
    </Page>
  );
}

/* ---------- Carte vers le parcours batterie ---------- */

function BatLearnCard({ completed, scores }: { completed: string[]; scores: Record<string, number> }) {
  const t = useT();
  const doneCount = ["bat-kit", "bat-tempo", "bat-grooves", "bat-fills"].filter((id) => completed.includes(id)).length;
  const exam = scores["bat-examen"] ?? 0;
  return (
    <div className="mb-10 grid gap-2 sm:grid-cols-2">
      <Link to="/batterie/parcours" className="card-lift group flex items-center gap-4 rounded-xl border border-line bg-surface p-5 text-fg no-underline">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-raised text-gold transition-colors group-hover:border-gold">
          <RouteIcon size={19} />
        </span>
        <span className="min-w-0">
          <span className="m-0 block font-mono text-xs whitespace-nowrap text-subtle">{t("bat.pathK")}</span>
          <span className="m-0 block font-display text-lg leading-snug text-balance">{t("bat.pathT")}</span>
          <span className="m-0 mt-0.5 block truncate font-mono text-xs text-gold">{doneCount}/4 · {exam > 0 ? `${exam} %` : t("bat.pathTodo")}</span>
        </span>
        <ChevronRight size={16} className="ml-auto shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
      </Link>
      <Link to="/batterie/examen" className="card-lift group flex items-center gap-4 rounded-xl border border-line bg-surface p-5 text-fg no-underline">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-raised text-gold transition-colors group-hover:border-gold">
          <ClipboardList size={19} />
        </span>
        <span className="min-w-0">
          <span className="m-0 block font-mono text-xs whitespace-nowrap text-subtle">{t("bat.examK")}</span>
          <span className="m-0 block font-display text-lg leading-snug text-balance">{t("bat.examT")}</span>
          <span className="m-0 mt-0.5 block truncate text-xs text-subtle">{exam >= 60 ? t("bat.examDone") : t("bat.examTodo")}</span>
        </span>
        <ChevronRight size={16} className="ml-auto shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
      </Link>
    </div>
  );
}

/* ---------- Mini-jeu : reconnais le rythme (4 manches, +XP, badge) ---------- */

const ROUNDS = 4;

function DrumQuiz() {
  const lang = useLang();
  const t = useT();
  const nav = useNavigate();
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const setScoreStore = useProgress((s) => s.setScore);
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState<Groove>(() => GROOVES[Math.floor(Math.random() * GROOVES.length)]);
  const [options, setOptions] = useState<Groove[]>(() => shuffle([...GROOVES]));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const lock = useRef(false);

  const playTarget = async (g: Groove) => {
    const ctx = await resumeAudio();
    const stepDur = 60 / 100 / 4;
    const t0 = ctx.currentTime + 0.06;
    for (let bar = 0; bar < GROOVE_BARS; bar++) {
      for (let s = 0; s < 16; s++) {
        const at = t0 + (bar * 16 + s) * stepDur;
        for (const k of g.steps[s]) playDrum(ctx, k, at, 0.5);
      }
    }
  };

  useEffect(() => {
    if (started && round < ROUNDS) void playTarget(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, round]);

  const done = started && round >= ROUNDS;

  const answer = (g: Groove) => {
    if (!started || done || lock.current || picked) return;
    lock.current = true;
    const ok = g.id === target.id;
    if (ok) setScore((x) => x + 1);
    setPicked(g.id);
    window.setTimeout(() => {
      setPicked(null);
      const finalScore = score + (ok ? 1 : 0);
      if (round + 1 >= ROUNDS) {
        const pct = Math.round((finalScore / ROUNDS) * 100);
        setScoreStore("batterie", pct);
        recordBest("batterie", finalScore);
        addXp(pct >= 60 ? 30 : 10, "feed.game");
      } else {
        const next = GROOVES[Math.floor(Math.random() * GROOVES.length)];
        setTarget(next);
        setOptions(shuffle([...GROOVES]));
      }
      setRound((r) => r + 1);
      lock.current = false;
    }, 650);
  };

  if (!started) {
    return (
      <div className="mb-4">
        <Button onClick={() => setStarted(true)}>
          <Play size={15} /> {t("ui.startExercise")}
        </Button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <Recap
        score={score}
        total={ROUNDS}
        onRetry={() => {
          setScore(0);
          setRound(0);
          setTarget(GROOVES[Math.floor(Math.random() * GROOVES.length)]);
          setOptions(shuffle([...GROOVES]));
          setStarted(true);
        }}
        onBack={() => nav({ to: "/" })}
        perfect={
          pct >= 60
            ? lang === "en"
              ? `Grooves locked in (+30 XP). The “Drummer” badge is yours.`
              : `Rythmes verrouillés (+30 XP). Le badge « Batteur » est à toi.`
            : lang === "en"
              ? "Below 60%: replay the groove, count the kick hits, then answer."
              : "Sous les 60 % : réécoute le rythme, compte les coups de grosse caisse, puis réponds."
        }
        ok={lang === "en" ? "Tip: punk hammers the kick, funk hisses the hi-hat." : "Astuce : le punk martèle la grosse caisse, le funk fait siffler le charleston."}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 font-mono text-xs text-subtle">
          {t("ui.question")} {round + 1}/{ROUNDS} · {t("ui.score")} {score}
        </p>
        <Button variant="outline" onClick={() => void playTarget(target)}>
          <Volume2 size={15} /> {t("ui.replay")}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((g) => {
          const show = picked !== null;
          const isTarget = g.id === target.id;
          const mine = picked === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => answer(g)}
              disabled={show}
              className={cn(
                "rounded-md border px-3 py-3.5 text-left transition-all active:scale-[0.98] disabled:cursor-default",
                !show && "border-line bg-surface text-muted hover:border-gold hover:text-fg",
                show && isTarget && "border-sage bg-sage-dim text-sage",
                show && mine && !isTarget && "border-danger bg-danger-dim text-danger",
                show && !isTarget && !mine && "border-line bg-surface text-subtle",
              )}
            >
              <span className="block font-display text-lg leading-tight">{lang === "en" ? g.en : g.fr}</span>
              <span className="block text-xs">{lang === "en" ? g.descEn : g.descFr}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
