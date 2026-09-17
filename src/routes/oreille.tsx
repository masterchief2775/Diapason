import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mic, Music2, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { freqForOffset, getAudioContext, playTone, resumeAudio, playIntervalAscending } from "@/lib/audio";
import { CHORD_QUALITIES, INTERVALS, MODES_MAJOR, PROGRESSION_LIBRARY, degreeChord, shuffle } from "@/lib/music";
import { useMic } from "@/lib/mic";
import type { DetectedNote } from "@/lib/pitch";
import { useProgress } from "@/lib/progress";
import { useLang, useNN, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/oreille")({ component: EarPage });

type Tab = "intervalles" | "accords" | "progressions" | "modes" | "micro";

const TAB_LABEL: Record<Tab, { fr: string; en: string }> = {
  intervalles: { fr: "intervalles", en: "intervals" },
  accords: { fr: "accords", en: "chords" },
  progressions: { fr: "progressions", en: "progressions" },
  modes: { fr: "modes", en: "modes" },
  micro: { fr: "🎙 micro", en: "🎙 mic" },
};

function EarPage() {
  const [tab, setTab] = useState<Tab>("intervalles");
  const lang = useLang();
  return (
    <Page>
      <Title
        kicker={lang === "en" ? "Free training" : "Entraînement libre"}
        lead={
          lang === "en"
            ? "Intervals, chords, progressions, modes — and your real guitar through the mic."
            : "Intervalles, accords, progressions, modes — et ta vraie guitare au micro."
        }
      >
        {lang === "en" ? "Musical ear" : "Oreille musicale"}
      </Title>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {(Object.keys(TAB_LABEL) as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm capitalize transition-colors",
              tab === key ? "border-gold bg-raised text-gold" : "border-line bg-surface text-muted",
            )}
          >
            {lang === "en" ? TAB_LABEL[key].en : TAB_LABEL[key].fr}
          </button>
        ))}
      </div>
      {tab === "intervalles" && <EarIntervals />}
      {tab === "accords" && <EarChords />}
      {tab === "progressions" && <EarProgressions />}
      {tab === "modes" && <EarModes />}
      {tab === "micro" && <EarMic />}
    </Page>
  );
}

/* ---------- Intervalles ---------- */

function EarIntervals() {
  const [question, setQuestion] = useState<(typeof INTERVALS)[number] | null>(null);
  const [choices, setChoices] = useState<(typeof INTERVALS)[number][]>([]);
  const [selected, setSelected] = useState<(typeof INTERVALS)[number] | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const total = 8;
  const t = useT();
  const lang = useLang();
  const addXp = useProgress((s) => s.addXp);
  const setScoreStore = useProgress((s) => s.setScore);
  const nav = useNavigate();
  const ivLabel = (o: (typeof INTERVALS)[number]) => (lang === "en" ? o.labelEn : o.label);

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
  const again = lang === "en" ? "Replay" : "Rejouer";

  return (
    <div>
      {!finished && question ? (
        <>
          <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
            <span>{round + 1} / {total}</span>
            <span className="text-sage">{t("ui.score")} {score}</span>
          </div>
          <button
            type="button"
            onClick={() => play(question.semis)}
            className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
          >
            <Music2 size={18} /> {again}
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
                  {ivLabel(opt)}
                </button>
              );
            })}
          </div>
          {selected && (
            <Button
              className="mt-5"
              onClick={() => {
                if (round + 1 >= total) {
                  const final = score;
                  addXp(final * 3, "feed.ear");
                  if (final === total) setScoreStore("oreille-parfait", 100);
                  setRound(total);
                } else {
                  setRound((r) => r + 1);
                  newQ();
                }
              }}
            >
              {round + 1 >= total ? t("ui.result") : t("ui.next")}
            </Button>
          )}
        </>
      ) : (
        <div className="pt-6 text-center">
          <h2 className="font-display text-3xl">{score} / {total}</h2>
          <p className="mb-6 text-sm text-muted">
            {score === total
              ? lang === "en" ? "8/8: “Golden ear” badge unlocked." : "8/8 : badge « Oreille d'or » débloqué."
              : score >= total - 1
                ? lang === "en" ? "Very sharp ear." : "Oreille très nette."
                : lang === "en" ? "Repetition trains the ear." : "La répétition muscle l'écoute."}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => { setScore(0); setRound(0); newQ(); }}>
              <RotateCcw size={15} /> {t("ui.retry")}
            </Button>
            <Button onClick={() => nav({ to: "/" })}>{lang === "en" ? "Home" : "Accueil"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Accords ---------- */

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
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const addXp = useProgress((s) => s.addXp);
  const qName = (q: (typeof CHORD_POOL)[number]) => (lang === "en" ? q.labelEn : q.label);

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
        <p className="mb-6 text-sm text-muted">
          {score >= 6
            ? lang === "en" ? "Chord colors are clear." : "Les couleurs d'accords sont claires."
            : lang === "en" ? "Re-listen to thirds: major vs minor first." : "Réécoute les tierces : majeur vs mineur d'abord."}
        </p>
        <Button variant="outline" onClick={() => { setScore(0); setRound(0); void deal(); }}>
          <RotateCcw size={15} /> {t("ui.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>{round + 1} / {total}</span>
        <span className="text-sage">{t("ui.score")} {score}</span>
      </div>
      <button
        type="button"
        onClick={() => playChordQuality(target.root, target.q.formula)}
        className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
      >
        <Music2 size={18} /> {lang === "en" ? "Replay the chord" : "Rejouer l'accord"} ({nn[target.root]} ?)
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
              {qName(o)} <span className="font-mono text-xs text-subtle">{o.degrees}</span>
            </button>
          );
        })}
      </div>
      {sel && (
        <Button
          className="mt-5"
          onClick={() => {
            if (round + 1 >= total) {
              addXp(score * 3, "feed.ear");
              setRound(total);
            } else {
              setRound((r) => r + 1);
              void deal();
            }
          }}
        >
          {round + 1 >= total ? t("ui.result") : t("ui.next")}
        </Button>
      )}
    </div>
  );
}

/* ---------- Progressions ---------- */

function EarProgressions() {
  const [target, setTarget] = useState(PROGRESSION_LIBRARY[0]);
  const [opts, setOpts] = useState(PROGRESSION_LIBRARY.slice(0, 4));
  const [sel, setSel] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const timers = useRef<number[]>([]);
  const total = 6;
  const t = useT();
  const lang = useLang();
  const addXp = useProgress((s) => s.addXp);

  useEffect(() => () => timers.current.forEach((tm) => clearTimeout(tm)), []);

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
    const tm = PROGRESSION_LIBRARY[Math.floor(Math.random() * PROGRESSION_LIBRARY.length)];
    const others = shuffle(PROGRESSION_LIBRARY.filter((p) => p.id !== tm.id)).slice(0, 3);
    setTarget(tm);
    setOpts(shuffle([tm, ...others]));
    setSel(null);
    timers.current.push(window.setTimeout(() => void playProg(tm), 250));
  };

  useEffect(() => {
    deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (round >= total) {
    return (
      <div className="pt-6 text-center">
        <h2 className="font-display text-3xl">{score} / {total}</h2>
        <p className="mb-6 text-sm text-muted">
          {score >= 4
            ? lang === "en" ? "You hear functions: tonic, subdominant, dominant." : "Tu entends les fonctions : tonique, sous-dominante, dominante."
            : lang === "en" ? "Tip: catch the V–I resolution at the end first." : "Astuce : repère d'abord la résolution V–I en fin de grille."}
        </p>
        <Button variant="outline" onClick={() => { setScore(0); setRound(0); deal(); }}>
          <RotateCcw size={15} /> {t("ui.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>{round + 1} / {total}</span>
        <span className="text-sage">{t("ui.score")} {score}</span>
      </div>
      <button
        type="button"
        onClick={() => void playProg(target)}
        className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
      >
        <Music2 size={18} /> {lang === "en" ? "Replay the progression" : "Rejouer la grille"}
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
          <p className="mt-3 text-xs leading-relaxed text-subtle">{lang === "en" ? target.analysisEn : target.analysis}</p>
          <Button
            className="mt-3"
            onClick={() => {
              if (round + 1 >= total) {
                addXp(score * 4, "feed.ear");
                setRound(total);
              } else {
                setRound((r) => r + 1);
                deal();
              }
            }}
          >
            {round + 1 >= total ? t("ui.result") : t("ui.next")}
          </Button>
        </>
      )}
    </div>
  );
}

/* ---------- Modes ---------- */

function EarModes() {
  const [deg, setDeg] = useState(0);
  const [opts, setOpts] = useState<number[]>([0, 1, 2, 3]);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const total = 6;
  const t = useT();
  const lang = useLang();
  const addXp = useProgress((s) => s.addXp);
  const parent = [0, 2, 4, 5, 7, 9, 11];
  const modeName = (d: number) => (lang === "en" ? MODES_MAJOR[d].nameEn : MODES_MAJOR[d].name);

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
        <p className="mb-6 text-sm text-muted">
          {score >= 4
            ? lang === "en" ? "Modal colors are sinking in." : "Les couleurs modales rentrent."
            : lang === "en" ? "Spot Lydian (dreamy ♯4) vs Phrygian (dark ♭2) first." : "Repère d'abord lydien (♯4 rêveur) vs phrygien (♭2 sombre)."}
        </p>
        <Button variant="outline" onClick={() => { setScore(0); setRound(0); deal(); }}>
          <RotateCcw size={15} /> {t("ui.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>{round + 1} / {total}</span>
        <span className="text-sage">{t("ui.score")} {score}</span>
      </div>
      <button
        type="button"
        onClick={() => void playMode(deg)}
        className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
      >
        <Music2 size={18} /> {lang === "en" ? "Replay the mode" : "Rejouer le mode"}
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
              {modeName(d)}
            </button>
          );
        })}
      </div>
      {sel !== null && (
        <>
          <p className="mt-3 text-xs text-subtle">
            {lang === "en" ? "That was" : "C'était"} {modeName(deg)} — {lang === "en" ? MODES_MAJOR[deg].colorEn : MODES_MAJOR[deg].color}
          </p>
          <Button
            className="mt-3"
            onClick={() => {
              if (round + 1 >= total) {
                addXp(score * 4, "feed.ear");
                setRound(total);
              } else {
                setRound((r) => r + 1);
                deal();
              }
            }}
          >
            {round + 1 >= total ? t("ui.result") : t("ui.next")}
          </Button>
        </>
      )}
    </div>
  );
}

/* ---------- Micro : accordeur + « joue ce que tu entends » ---------- */

const OPEN_STRINGS = [
  { label: "6", midi: 40 },
  { label: "5", midi: 45 },
  { label: "4", midi: 50 },
  { label: "3", midi: 55 },
  { label: "2", midi: 59 },
  { label: "1", midi: 64 },
];

function midiToFreq(m: number) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function EarMic() {
  const [mode, setMode] = useState<"tuner" | "defi">("defi");
  const lang = useLang();
  return (
    <div>
      <div className="mb-5 flex gap-1.5">
        {(
          [
            { id: "defi", fr: "Joue ce que tu entends", en: "Play what you hear" },
            { id: "tuner", fr: "Accordeur", en: "Tuner" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              mode === m.id ? "border-gold bg-raised text-gold" : "border-line bg-surface text-muted",
            )}
          >
            {lang === "en" ? m.en : m.fr}
          </button>
        ))}
      </div>
      {mode === "tuner" ? <Tuner /> : <PlayWhatYouHear />}
    </div>
  );
}

function MicGate({ children }: { children: (api: ReturnType<typeof useMic>) => React.ReactNode }) {
  const api = useMic();
  const lang = useLang();
  if (api.state === "idle" || api.state === "starting") {
    return (
      <div className="rounded-md border border-line bg-surface p-6 text-center">
        <Mic size={22} className="mx-auto mb-3 text-gold" />
        <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-muted">
          {lang === "en"
            ? "The mic stays on your device: analysis runs live in the browser, nothing is recorded or sent."
            : "Le micro reste sur ton appareil : l'analyse se fait en direct dans le navigateur, rien n'est enregistré ni envoyé."}
        </p>
        <Button onClick={api.start} disabled={api.state === "starting"}>
          {api.state === "starting"
            ? lang === "en" ? "Enabling…" : "Activation…"
            : lang === "en" ? "Enable microphone" : "Activer le micro"}
        </Button>
      </div>
    );
  }
  if (api.state === "denied" || api.state === "missing") {
    return (
      <div className="rounded-md border border-danger bg-danger-dim p-5 text-sm text-danger">
        {api.state === "denied"
          ? lang === "en"
            ? "Microphone denied. Allow access in the browser address bar, then reload."
            : "Micro refusé. Autorise l'accès dans la barre d'adresse du navigateur, puis recharge."
          : lang === "en"
            ? "No microphone found on this device."
            : "Pas de micro détecté sur cet appareil."}
      </div>
    );
  }
  return <>{children(api)}</>;
}

function CentsMeter({ cents }: { cents: number }) {
  const clamped = Math.max(-50, Math.min(50, cents));
  const ok = Math.abs(cents) <= 8;
  return (
    <div>
      <div className="relative h-2 overflow-hidden rounded-full bg-line">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-subtle" />
        <div
          className={cn("absolute top-0 bottom-0 rounded-full", ok ? "bg-sage" : "bg-gold")}
          style={{
            left: clamped < 0 ? `${50 + clamped}%` : "50%",
            width: `${Math.abs(clamped)}%`,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-subtle">
        <span>-50</span>
        <span className={ok ? "text-sage" : "text-gold"}>{cents > 0 ? `+${cents}` : cents} cents</span>
        <span>+50</span>
      </div>
    </div>
  );
}

function Tuner() {
  const lang = useLang();
  const nn = useNN();
  return (
    <MicGate>
      {(api) => (
        <div className="rounded-md border border-line bg-surface p-6 text-center">
          <p className="mb-1 font-display text-5xl text-gold">{api.live ? nn[api.live.midi % 12] : "—"}</p>
          <p className="mb-4 font-mono text-xs text-subtle">
            {api.live ? `${api.live.freq.toFixed(1)} Hz` : "…"}
          </p>
          <div className="mx-auto mb-5 max-w-sm">
            <CentsMeter cents={api.live?.cents ?? 0} />
          </div>
          <div className="mb-5 flex flex-wrap justify-center gap-1.5">
            {OPEN_STRINGS.map((s) => {
              const dist = api.live ? api.live.midi - s.midi : null;
              const near = dist != null && Math.abs(dist) <= 6;
              return (
                <span
                  key={s.label}
                  className={cn(
                    "rounded-sm border px-2.5 py-1.5 font-mono text-xs",
                    near ? "border-gold bg-raised text-gold" : "border-line text-subtle",
                  )}
                >
                  {s.label} · {nn[[4, 9, 2, 7, 11, 4][6 - Number(s.label)] ?? 0]}
                  {near && dist !== 0 ? ` (${dist > 0 ? "+" : ""}${dist * 100}c)` : ""}
                </span>
              );
            })}
          </div>
          <Button variant="outline" onClick={api.stop}>
            {lang === "en" ? "Stop mic" : "Couper le micro"}
          </Button>
        </div>
      )}
    </MicGate>
  );
}

function PlayWhatYouHear() {
  const total = 8;
  const [target, setTarget] = useState(45);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [verdict, setVerdict] = useState<"ok" | "ko" | null>(null);
  const [heard, setHeard] = useState<DetectedNote | null>(null);
  const waitingRef = useRef(true);
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const addXp = useProgress((s) => s.addXp);

  const deal = () => {
    setTarget(40 + Math.floor(Math.random() * 25));
    setVerdict(null);
    setHeard(null);
    waitingRef.current = true;
  };

  useEffect(deal, []);

  const api = useMic((note) => {
    if (!waitingRef.current || round >= total) return;
    waitingRef.current = false;
    setHeard(note);
    const good = note.midi === target && Math.abs(note.cents) <= 30;
    setVerdict(good ? "ok" : "ko");
    if (good) setScore((s) => s + 1);
  });

  const playTarget = async () => {
    const ctx = await resumeAudio();
    playTone(ctx, midiToFreq(target), ctx.currentTime + 0.05, 1.0, 0.5);
  };

  useEffect(() => {
    if (api.state === "live") {
      const tm = window.setTimeout(() => void playTarget(), 600);
      return () => window.clearTimeout(tm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.state, round]);

  if (api.state !== "live") {
    return <MicGate>{() => null}</MicGate>;
  }

  if (round >= total) {
    return (
      <div className="pt-6 text-center">
        <h2 className="font-display text-3xl">{score} / {total}</h2>
        <p className="mb-6 text-sm text-muted">
          {score >= 6
            ? lang === "en" ? "Your playing matches your ear." : "Ton jeu colle à ton oreille."
            : lang === "en" ? "Sing the note before playing it: voice steadies the ear." : "Chante la note avant de la jouer : la voix cale l'oreille."}
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => { setScore(0); setRound(0); deal(); }}>
            <RotateCcw size={15} /> {t("ui.retry")}
          </Button>
          <Button onClick={api.stop}>{lang === "en" ? "Stop mic" : "Couper le micro"}</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
        <span>{round + 1} / {total}</span>
        <span className="text-sage">{t("ui.score")} {score}</span>
      </div>
      <button
        type="button"
        onClick={playTarget}
        className="mx-auto mb-4 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
      >
        <Volume2 size={18} /> {lang === "en" ? "Replay the target note" : "Réécouter la note cible"}
      </button>
      <p className="mb-1 text-center text-sm text-muted">
        {lang === "en" ? "Your turn: play it on your real guitar." : "À toi : joue-la sur ta vraie guitare."}
      </p>
      <p className="mb-5 text-center font-mono text-xs text-subtle">
        {lang === "en" ? "Mic hears:" : "Micro entend :"} {api.live ? `${nn[api.live.midi % 12]} (${api.live.cents > 0 ? "+" : ""}${api.live.cents}c)` : "…"}
      </p>
      {verdict && heard && (
        <div
          className={cn(
            "mb-4 rounded-md border px-4 py-3 text-sm",
            verdict === "ok" ? "border-sage bg-sage-dim text-sage" : "border-danger bg-danger-dim text-danger",
          )}
        >
          {verdict === "ok"
            ? lang === "en" ? `Spot on! ${nn[heard.midi % 12]} dead center.` : `Juste ! ${nn[heard.midi % 12]} pile dans le mille.`
            : lang === "en"
              ? `You played ${nn[heard.midi % 12]} — target was ${nn[target % 12]}. Listen again and adjust.`
              : `Tu as joué ${nn[heard.midi % 12]} — la cible était ${nn[target % 12]}. Réécoute et ajuste.`}
        </div>
      )}
      {verdict && (
        <Button
          onClick={() => {
            if (round + 1 >= total) {
              addXp(score * 4, "feed.ear");
              setRound(total);
            } else {
              setRound((r) => r + 1);
              deal();
            }
          }}
        >
          {round + 1 >= total ? t("ui.result") : lang === "en" ? "Next note" : "Note suivante"}
        </Button>
      )}
    </div>
  );
}
