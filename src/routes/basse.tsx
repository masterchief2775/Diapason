import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, ClipboardList, Play, Route as RouteIcon, Volume2 } from "lucide-react";
import { BassNeck } from "@/components/bass-neck";
import { Button, Chip } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { Recap } from "@/features/quiz-block";
import { BASS_MIDI, BASS_PATTERNS, BASS_PC, bassNoteAt, playBassPattern, playBassString, playBassTuning } from "@/lib/bass";
import { SCALES } from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { useLang, useNN, useT } from "@/lib/i18n";

export const Route = createFileRoute("/basse")({ component: BasseLayout });

/** Route parente : le hub seul sur /basse, <Outlet/> sur les sous-pages. */
function BasseLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/basse" && pathname !== "/basse/") return <Outlet />;
  return <BassePage />;
}

function BassePage() {
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const [root, setRoot] = useState(4);
  const [scaleId, setScaleId] = useState<(typeof SCALES)[number]["id"]>("majeure");
  const scale = SCALES.find((s) => s.id === scaleId)!;
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);

  return (
    <Page wide>
      <Title kicker={t("basse.kicker")} lead={t("basse.lead")}>
        {t("basse.title")}
      </Title>

      <BasseLearnCard completed={completed} scores={scores} />

      <h2 className="mb-1 font-display text-xl">{t("basse.tuning")}</h2>
      <p className="mt-0 mb-3 text-sm text-muted">{t("basse.tuningLead")}</p>
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {BASS_PC.map((pc, s) => (
          <button
            key={s}
            type="button"
            onClick={() => void playBassString(s)}
            className="rounded-xl border border-line bg-surface p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <span className="font-mono text-[11px] text-subtle">{lang === "en" ? "String" : "Corde"} {4 - s}</span>
            <span className="block font-display text-2xl text-gold">{nn[pc]}</span>
            {/* Nom + octave réels par corde (Mi1, La1…), pas le même texte partout. */}
            <span className="text-xs text-subtle">{t("basse.open")} · {nn[pc]}{Math.floor(BASS_MIDI[s] / 12) - 1}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => void playBassTuning()}
          className="grid place-items-center gap-1 rounded-xl border border-gold/40 bg-raised p-4 text-gold shadow-sm transition-transform active:scale-[0.98]"
        >
          <Volume2 size={20} />
          <span className="text-sm font-medium">{t("basse.playAll")}</span>
        </button>
      </div>

      <h2 className="mb-1 font-display text-xl">{t("basse.scales")}</h2>
      <p className="mt-0 mb-3 text-sm text-muted">{t("basse.scalesLead")}</p>
      <div className="mb-5 flex flex-wrap gap-8">
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{lang === "en" ? "Tonic" : "Tonique"}</p>
          <div className="flex max-w-sm flex-wrap gap-1.5">
            {nn.map((n, i) => (
              <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{lang === "en" ? "Scale" : "Gamme"}</p>
          <div className="flex max-w-md flex-wrap gap-1.5">
            {SCALES.map((s) => (
              <Chip key={s.id} tone="sage" active={s.id === scaleId} onClick={() => setScaleId(s.id)}>
                {lang === "en" ? s.labelEn : s.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-10">
        <BassNeck highlight={{ rootIndex: root, steps: scale.steps }} hear />
      </div>

      <h2 className="mb-1 font-display text-xl">{t("basse.patterns")}</h2>
      <p className="mt-0 mb-3 text-sm text-muted">{t("basse.patternsLead")}</p>
      <div className="mb-10 grid gap-2 md:grid-cols-3">
        {BASS_PATTERNS.map((p) => (
          <div key={p.id} className="panel-sheen rounded-xl border border-line bg-surface p-4 shadow-sm">
            <p className="m-0 font-display text-lg">{lang === "en" ? p.en : p.fr}</p>
            <p className="mt-1 mb-3 text-sm text-muted">{lang === "en" ? p.descEn : p.descFr}</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {p.offsets.map((o, i) => (
                <span key={i} className="rounded-sm border border-line bg-raised px-2 py-1 font-mono text-xs text-gold">
                  {nn[o % 12]}{o >= 12 ? "⁺" : ""}
                </span>
              ))}
            </div>
            <Button variant="outline" onClick={() => void playBassPattern(p.offsets)}>
              <Play size={14} /> {t("ui.listen")}
            </Button>
          </div>
        ))}
      </div>

      <h2 className="mb-1 font-display text-xl">{t("basse.game")}</h2>
      <p className="mt-0 mb-3 text-sm text-muted">{t("basse.gameLead")}</p>
      <BassQuiz />
    </Page>
  );
}

/* ---------- Carte vers le parcours basse ---------- */

function BasseLearnCard({ completed, scores }: { completed: string[]; scores: Record<string, number> }) {
  const t = useT();
  const doneCount = ["basse-role", "basse-notes", "basse-gammes", "basse-groove"].filter((id) => completed.includes(id)).length;
  const exam = scores["basse-examen"] ?? 0;
  return (
    <div className="mb-10 grid gap-2 sm:grid-cols-2">
      <Link to="/basse/parcours" className="card-lift group flex items-center gap-4 rounded-xl border border-line bg-surface p-5 text-fg no-underline">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-raised text-gold transition-colors group-hover:border-gold">
          <RouteIcon size={19} />
        </span>
        <span className="min-w-0">
          <span className="m-0 block font-mono text-xs whitespace-nowrap text-subtle">{t("basse.pathK")}</span>
          <span className="m-0 block font-display text-lg leading-snug text-balance">{t("basse.pathT")}</span>
          <span className="m-0 mt-0.5 block truncate font-mono text-xs text-gold">{doneCount}/4 · {exam > 0 ? `${exam} %` : t("basse.pathTodo")}</span>
        </span>
        <ChevronRight size={16} className="ml-auto shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
      </Link>
      <Link to="/basse/examen" className="card-lift group flex items-center gap-4 rounded-xl border border-line bg-surface p-5 text-fg no-underline">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-raised text-gold transition-colors group-hover:border-gold">
          <ClipboardList size={19} />
        </span>
        <span className="min-w-0">
          <span className="m-0 block font-mono text-xs whitespace-nowrap text-subtle">{t("basse.examK")}</span>
          <span className="m-0 block font-display text-lg leading-snug text-balance">{t("basse.examT")}</span>
          <span className="m-0 mt-0.5 block truncate text-xs text-subtle">{exam >= 60 ? t("basse.examDone") : t("basse.examTodo")}</span>
        </span>
        <ChevronRight size={16} className="ml-auto shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
      </Link>
    </div>
  );
}

/* ---------- Mini-jeu : trouve la note (5 manches, +XP, badge) ---------- */

const ROUNDS = 5;

function BassQuiz() {
  const lang = useLang();
  const nn = useNN();
  const t = useT();
  const nav = useNavigate();
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const setScoreStore = useProgress((s) => s.setScore);
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 12));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [flash, setFlash] = useState<{ s: number; f: number; ok: boolean } | null>(null);
  const lock = useRef(false);
  const timer = useRef<number | null>(null);

  // Quitter pendant le flash : pas de score/XP appliqués après démontage.
  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const playTarget = async (pc: number) => {
    // Note demandée jouée corde de La (grave et claire).
    const f = (pc - BASS_PC[1] + 12) % 12;
    await playBassString(1, f, 0.8);
  };

  useEffect(() => {
    if (started && round < ROUNDS) void playTarget(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, round]);

  const done = started && round >= ROUNDS;

  const guess = (s: number, f: number) => {
    if (!started || done || lock.current) return;
    lock.current = true;
    const ok = bassNoteAt(s, f) === target;
    if (ok) setScore((x) => x + 1);
    setFlash({ s, f, ok });
    timer.current = window.setTimeout(() => {
      setFlash(null);
      const nextRound = round + 1;
      const finalScore = score + (ok ? 1 : 0);
      if (nextRound >= ROUNDS) {
        const pct = Math.round((finalScore / ROUNDS) * 100);
        setScoreStore("basse", pct);
        if (recordBest("basse", finalScore) && finalScore > 0) addXp(pct >= 60 ? 30 : 10, "feed.game");
      } else {
        setTarget(Math.floor(Math.random() * 12));
      }
      setRound(nextRound);
      lock.current = false;
    }, 500);
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
          setTarget(Math.floor(Math.random() * 12));
          setStarted(true);
        }}
        onBack={() => nav({ to: "/" })}
        fanfareTimbre="basse"
        perfect={
          pct >= 60
            ? lang === "en"
              ? `Bass locked in (+30 XP).${score === ROUNDS ? " Flawless." : ""} The “Bassist” badge is yours.`
              : `Basse verrouillée (+30 XP).${score === ROUNDS ? " Sans faute." : ""} Le badge « Bassiste » est à toi.`
            : lang === "en"
              ? "Below 60%: replay the target note, then hunt it down the neck."
              : "Sous les 60 % : réécoute la note cible, puis traque-la sur le manche."
        }
        ok={lang === "en" ? "Tip: octaves repeat every 12 frets on one string." : "Astuce : les octaves se répètent toutes les 12 cases sur une corde."}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 font-display text-xl">
          {t("basse.find")} : <span className="text-gold">{nn[target]}</span>
          <span className="ml-3 font-mono text-xs text-subtle">{t("basse.round")} {round + 1}/{ROUNDS} · {t("ui.score")} {score}</span>
        </p>
        <Button variant="outline" onClick={() => void playTarget(target)}>
          <Volume2 size={15} /> {t("ui.replay")}
        </Button>
      </div>
      <BassNeck onCellClick={guess} flash={flash} hear={false} />
      {flash && (
        <p className={flash.ok ? "mt-3 text-sm text-sage" : "mt-3 text-sm text-muted"}>
          {flash.ok
            ? lang === "en" ? "Locked in." : "Verrouillé."
            : lang === "en" ? `${t("basse.youPlayed")} ${nn[bassNoteAt(flash.s, flash.f)]}.` : `${t("basse.youPlayed")} ${nn[bassNoteAt(flash.s, flash.f)]}.`}
        </p>
      )}
    </div>
  );
}
