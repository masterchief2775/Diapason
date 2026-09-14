import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Music2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { freqForOffset, getAudioContext, playTone, resumeAudio, playIntervalAscending } from "@/lib/audio";
import { CHORD_QUALITIES, INTERVALS, MODES_MAJOR, NOTES, PROGRESSION_LIBRARY, degreeChord, shuffle } from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/oreille")({ component: EarPage });

type Tab = "intervalles" | "accords" | "progressions" | "modes";

function EarPage() {
  const [tab, setTab] = useState<Tab>("intervalles");
  return (
    <Page>
      <Title kicker="Entraînement libre" lead="Intervalles, accords, progressions, modes. L'oreille se muscle par séries courtes.">
        Oreille musicale
      </Title>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {(["intervalles", "accords", "progressions", "modes"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-sm border px-3 py-2 text-sm capitalize",
              tab === t ? "border-gold bg-raised text-gold" : "border-line bg-surface text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "intervalles" && <EarIntervals />}
      {tab === "accords" && <EarChords />}
      {tab === "progressions" && <EarProgressions />}
      {tab === "modes" && <EarModes />}
    </Page>
  );
}

/* ---------- Intervalles (existant, + badge oreille) ---------- */

function EarIntervals() {
  const [question, setQuestion] = useState<(typeof INTERVALS)[number] | null>(null);
  const [choices, setChoices] = useState<(typeof INTERVALS)[number][]>([]);
  const [selected, setSelected] = useState<(typeof INTERVALS)[number] | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const total = 8;
  const addXp = useProgress((s) => s.addXp);
  const setScoreStore = useProgress((s) => s.setScore);
  const nav = useNavigate();

  const play = async (semis: number) => {
    await resumeAudio();
    playIntervalAscending(4, semis);
  };

  const newQ = () => {
    const shuffled = shuffle([...INTERVALS]);
    const correct = shuffled[0];
    const opts = shuffle(shuffled.slice(0, 4));
    setQuestion(correct);
    setChoices(opts);
    setSelected(null);
    setTimeout(() => play(correct.semis), 200);
  };

  useEffect(() => {
    newQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = round >= total;

  return (
    <div>
      {!finished && question ? (
        <>
          <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
            <span>{round + 1} / {total}</span>
            <span className="text-sage">Score {score}</span>
          </div>
          <button
            type="button"
            onClick={() => play(question.semis)}
            className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
          >
            <Music2 size={18} /> Rejouer
          </button>
          <div className="grid grid-cols-2 gap-2">
            {choices.map((opt) => {
              const show = !!selected;
              const ok = opt.semis === question.semis;
              const mine = selected?.semis === opt.semis;
              return (
                <button
                  key={opt.semis}
                  type="button"
                  onClick={() => {
                    if (selected) return;
                    setSelected(opt);
                    if (opt.semis === question.semis) setScore((s) => s + 1);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-3 text-left text-sm capitalize",
                    !show && "border-line bg-surface text-muted",
                    show && ok && "border-sage bg-sage-dim text-sage",
                    show && mine && !ok && "border-danger bg-danger-dim text-danger",
                    show && !ok && !mine && "border-line bg-surface text-subtle",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {selected && (
            <Button
              className="mt-5"
              onClick={() => {
                if (round + 1 >= total) {
                  const final = score + (selected.semis === question.semis ? 0 : 0);
                  addXp(final * 3);
                  if (final === total) setScoreStore("oreille-parfait", 100);
                  setRound(total);
                } else {
                  setRound((r) => r + 1);
                  newQ();
                }
              }}
            >
              {round + 1 >= total ? "Résultat" : "Suivant"}
            </Button>
          )}
        </>
      ) : (
        <div className="pt-6 text-center">
          <h2 className="font-display text-3xl">{score} / {total}</h2>
          <p className="mb-6 text-sm text-muted">
            {score === total ? "8/8 : badge « Oreille d'or » débloqué." : score >= total - 1 ? "Oreille très nette." : "La répétition muscle l'écoute."}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => { setScore(0); setRound(0); newQ(); }}>
              <RotateCcw size={15} /> Refaire
            </Button>
            <Button onClick={() => nav({ to: "/" })}>Accueil</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Accords : majeur / mineur / diminué / augmenté / 7e ---------- */

const CHORD_POOL = CHORD_QUALITIES.filter((q) => ["maj", "min", "dim", "aug", "dom7", "maj7", "min7"].includes(q.id));

function playChordQuality(root: number, formula: readonly number[]) {
  const ctx = getAudioContext();
  const now = ctx.currentTime + 0.03;
  formula.forEach((iv, i) => {
    playTone(ctx, freqForOffset(root, iv), now, 1.0, 0.13 - i * 0.01);
  });
}

function EarChords() {
  const [target, setTarget] = useState<{ root: number; q: (typeof CHORD_POOL)[number] }>(() => ({
    root: 0,
    q: CHORD_POOL[0],
  }));
  const [opts, setOpts] = useState<(typeof CHORD_POOL)[number][]>(CHORD_POOL.slice(0, 4));
  const [sel, setSel] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const total = 8;
  const addXp = useProgress((s) => s.addXp);

  const deal = async () => {
    const root = Math.floor(Math.random() * 12);
    const q = CHORD_POOL[Math.floor(Math.random() * CHORD_POOL.length)];
    const others = shuffle(CHORD_POOL.filter((c) => c.id !== q.id)).slice(0, 3);
    const four = shuffle([q, ...others]);
    setTarget({ root, q });
    setOpts(four);
    setSel(null);
    await resumeAudio();
    setTimeout(() => playChordQuality(root, q.formula), 200);
  };

  useEffect(() => {
    void deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (round >= total) {
    return (
      <div className="pt-6 text-center">
        <h2 className="font-display text-3xl">{score} / {total}</h2>
        <p className="mb-6 text-sm text-muted">{score >= 6 ? "Les couleurs d'accords sont claires." : "Réécoute les tierces : majeur vs mineur d'abord."}</p>
        <Button variant="outline" onClick={() => { setScore(0); setRound(0); void deal(); }}>
          <RotateCcw size={15} /> Refaire
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>{round + 1} / {total}</span>
        <span className="text-sage">Score {score}</span>
      </div>
      <button
        type="button"
        onClick={() => playChordQuality(target.root, target.q.formula)}
        className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
      >
        <Music2 size={18} /> Rejouer l'accord ({NOTES[target.root]} ?)
      </button>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((o) => {
          const show = sel !== null;
          const ok = o.id === target.q.id;
          const mine = sel === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                if (sel) return;
                setSel(o.id);
                if (ok) setScore((s) => s + 1);
              }}
              className={cn(
                "rounded-md border px-3 py-3 text-left text-sm",
                !show && "border-line bg-surface text-muted",
                show && ok && "border-sage bg-sage-dim text-sage",
                show && mine && !ok && "border-danger bg-danger-dim text-danger",
                show && !ok && !mine && "border-line bg-surface text-subtle",
              )}
            >
              {o.label} <span className="font-mono text-xs text-subtle">{o.degrees}</span>
            </button>
          );
        })}
      </div>
      {sel && (
        <Button
          className="mt-5"
          onClick={() => {
            if (round + 1 >= total) {
              addXp(score * 3);
              setRound(total);
            } else {
              setRound((r) => r + 1);
              void deal();
            }
          }}
        >
          {round + 1 >= total ? "Résultat" : "Suivant"}
        </Button>
      )}
    </div>
  );
}

/* ---------- Progressions : nomme la grille ---------- */

function EarProgressions() {
  const [target, setTarget] = useState(PROGRESSION_LIBRARY[0]);
  const [opts, setOpts] = useState(PROGRESSION_LIBRARY.slice(0, 4));
  const [sel, setSel] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const timers = useRef<number[]>([]);
  const total = 6;
  const addXp = useProgress((s) => s.addXp);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const playProg = async (p: typeof target) => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    p.degrees.forEach((d, i) => {
      const ch = degreeChord(0, p.mode, d % 7);
      ch.quality.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(0, ch.rootOffset + iv), now + i * 0.8, 0.75, 0.11);
      });
    });
  };

  const deal = () => {
    const t = PROGRESSION_LIBRARY[Math.floor(Math.random() * PROGRESSION_LIBRARY.length)];
    const others = shuffle(PROGRESSION_LIBRARY.filter((p) => p.id !== t.id)).slice(0, 3);
    setTarget(t);
    setOpts(shuffle([t, ...others]));
    setSel(null);
    timers.current.push(window.setTimeout(() => void playProg(t), 250));
  };

  useEffect(() => {
    deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (round >= total) {
    return (
      <div className="pt-6 text-center">
        <h2 className="font-display text-3xl">{score} / {total}</h2>
        <p className="mb-6 text-sm text-muted">{score >= 4 ? "Tu entends les fonctions : tonique, sous-dominante, dominante." : "Astuce : repère d'abord la résolution V–I en fin de grille."}</p>
        <Button variant="outline" onClick={() => { setScore(0); setRound(0); deal(); }}>
          <RotateCcw size={15} /> Refaire
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>{round + 1} / {total}</span>
        <span className="text-sage">Score {score}</span>
      </div>
      <button
        type="button"
        onClick={() => void playProg(target)}
        className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
      >
        <Music2 size={18} /> Rejouer la grille
      </button>
      <div className="grid gap-2">
        {opts.map((o) => {
          const show = sel !== null;
          const ok = o.id === target.id;
          const mine = sel === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                if (sel) return;
                setSel(o.id);
                if (ok) setScore((s) => s + 1);
              }}
              className={cn(
                "rounded-md border px-4 py-3 text-left text-sm",
                !show && "border-line bg-surface text-fg",
                show && ok && "border-sage bg-sage-dim text-sage",
                show && mine && !ok && "border-danger bg-danger-dim text-danger",
                show && !ok && !mine && "border-line bg-surface text-muted",
              )}
            >
              {o.label} <span className="font-mono text-xs text-gold">{o.numerals}</span>
            </button>
          );
        })}
      </div>
      {sel && (
        <>
          <p className="mt-3 text-xs leading-relaxed text-subtle">{target.analysis}</p>
          <Button
            className="mt-3"
            onClick={() => {
              if (round + 1 >= total) {
                addXp(score * 4);
                setRound(total);
              } else {
                setRound((r) => r + 1);
                deal();
              }
            }}
          >
            {round + 1 >= total ? "Résultat" : "Suivant"}
          </Button>
        </>
      )}
    </div>
  );
}

/* ---------- Modes : reconnais la couleur ---------- */

function EarModes() {
  const [deg, setDeg] = useState(0);
  const [opts, setOpts] = useState<number[]>([0, 1, 2, 3]);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const total = 6;
  const addXp = useProgress((s) => s.addXp);
  const parent = [0, 2, 4, 5, 7, 9, 11];

  const stepsFor = (d: number) =>
    parent.map((s) => (s - parent[d] + 12) % 12).sort((a, b) => a - b);

  const playMode = async (d: number) => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    const steps = stepsFor(d);
    [...steps, 12].forEach((iv, i) => {
      playTone(ctx, freqForOffset(0, iv), now + i * 0.32, 0.3, 0.15);
    });
  };

  const deal = () => {
    const d = Math.floor(Math.random() * 7);
    const others = shuffle([0, 1, 2, 3, 4, 5, 6].filter((x) => x !== d)).slice(0, 3);
    setDeg(d);
    setOpts(shuffle([d, ...others]));
    setSel(null);
    setTimeout(() => void playMode(d), 250);
  };

  useEffect(() => {
    deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (round >= total) {
    return (
      <div className="pt-6 text-center">
        <h2 className="font-display text-3xl">{score} / {total}</h2>
        <p className="mb-6 text-sm text-muted">{score >= 4 ? "Les couleurs modales rentrent." : "Repère d'abord lydien (♯4 rêveur) vs phrygien (♭2 sombre)."}</p>
        <Button variant="outline" onClick={() => { setScore(0); setRound(0); deal(); }}>
          <RotateCcw size={15} /> Refaire
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>{round + 1} / {total}</span>
        <span className="text-sage">Score {score}</span>
      </div>
      <button
        type="button"
        onClick={() => void playMode(deg)}
        className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
      >
        <Music2 size={18} /> Rejouer le mode
      </button>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((d) => {
          const show = sel !== null;
          const ok = d === deg;
          const mine = sel === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                if (sel !== null) return;
                setSel(d);
                if (ok) setScore((s) => s + 1);
              }}
              className={cn(
                "rounded-md border px-3 py-3 text-left text-sm",
                !show && "border-line bg-surface text-muted",
                show && ok && "border-sage bg-sage-dim text-sage",
                show && mine && !ok && "border-danger bg-danger-dim text-danger",
                show && !ok && !mine && "border-line bg-surface text-subtle",
              )}
            >
              {MODES_MAJOR[d].name}
            </button>
          );
        })}
      </div>
      {sel !== null && (
        <>
          <p className="mt-3 text-xs text-subtle">C'était {MODES_MAJOR[deg].name} — {MODES_MAJOR[deg].color}</p>
          <Button
            className="mt-3"
            onClick={() => {
              if (round + 1 >= total) {
                addXp(score * 4);
                setRound(total);
              } else {
                setRound((r) => r + 1);
                deal();
              }
            }}
          >
            {round + 1 >= total ? "Résultat" : "Suivant"}
          </Button>
        </>
      )}
    </div>
  );
}
