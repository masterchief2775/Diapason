import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { BackLink, Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { Recap } from "@/features/quiz-block";
import { freqForOffset, playTone, resumeAudio } from "@/lib/audio";
import { CHORD_QUALITIES, INTERVALS, SCALES, TUNING, degreeChord, noteAt } from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { useLang, useNN, useT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jeux/$id")({
  component: GameRoute,
});

function GameRoute() {
  const { id } = Route.useParams();
  const lang = useLang();
  if (id === "intervalles") return <IntervalRace />;
  if (id === "accorde") return <ChordRace />;
  if (id === "trou") return <MissingNote />;
  if (id === "dictee") return <Dictee />;
  if (id === "minute") return <MinuteGrid />;
  if (id === "compo60") return <Compo60 />;
  return (
    <Page>
      <p>{lang === "en" ? "Game not found." : "Jeu introuvable."}</p>
    </Page>
  );
}

/** Compte à rebours partagé : appelle onEnd une fois, avec un state toujours frais. */
function useCountdown(total: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(total);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      onEndRef.current();
      return;
    }
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, left]);
  return { left, reset: () => setLeft(total) };
}

/** Bandeau d'urgence quand le chrono tombe sous 10 s. */
function Urgency({ left, lang }: { left: number; lang: Lang }) {
  if (left > 10) return null;
  return (
    <p className="mb-3 flex items-center gap-1.5 font-mono text-xs text-danger">
      <span className="live-dot inline-block size-1.5 rounded-full bg-danger" aria-hidden />
      {left}s — {lang === "en" ? "hurry!" : "vite !"}
    </p>
  );
}

function IntervalRace() {
  const [q, setQ] = useState<(typeof INTERVALS)[number]>(INTERVALS[4]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(false);
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const prevBest = useProgress((s) => s.bestScores["intervalles"] ?? 0);
  const nav = useNavigate();
  const lang = useLang();

  const { left, reset } = useCountdown(30, !done, () => {
    setDone(true);
  });

  useEffect(() => {
    if (!done) return;
    addXp(score, "feed.game");
    recordBest("intervalles", score);
    setBest(score > 0 && score >= prevBest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label={lang === "en" ? "Games" : "Jeux"} />
      <Title kicker={`${left}s · record ${Math.max(prevBest, done ? score : 0)} pts`} lead={lang === "en" ? "Click the fret on the 6th string. Every hit chains." : "Clique la case sur la 6e corde. Chaque bonne réponse enchaîne."}>
        {lang === "en" ? "Interval race" : "Course d'intervalles"} · {score} pts
      </Title>
      {!done && <Urgency left={left} lang={lang} />}
      {!done ? (
        <>
          <h2 className="mb-4 font-display text-xl">{lang === "en" ? q.labelEn : q.label}</h2>
          <Fretboard
            highlight={{ rootIndex: TUNING[0], steps: [] }}
            onCellClick={(s, f) => {
              if (s !== 0) return;
              if (f === q.semis) {
                setScore((x) => x + 1);
                setQ(INTERVALS[Math.floor(Math.random() * INTERVALS.length)]);
              }
            }}
          />
        </>
      ) : (
        <Recap
          score={score}
          total={0}
          onRetry={() => {
            setScore(0);
            setBest(false);
            setDone(false);
            reset();
          }}
          onBack={() => nav({ to: "/jeux" })}
          perfect={best ? (lang === "en" ? "New record! Fast and accurate." : "Nouveau record ! Rapide et juste.") : lang === "en" ? "Fast and accurate." : "Rapide et juste."}
          ok={lang === "en" ? "Tempo will come back." : "Le tempo reviendra."}
        />
      )}
    </Page>
  );
}

function ChordRace() {
  const pool = CHORD_QUALITIES.filter((q) => q.formula.length === 3);
  const [target, setTarget] = useState(() => ({
    root: Math.floor(Math.random() * 12),
    q: pool[0],
  }));
  const [picked, setPicked] = useState<{ s: number; f: number; note: number }[]>([]);
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);
  const nav = useNavigate();
  const lang = useLang();
  const nn = useNN();
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const prevBest = useProgress((s) => s.bestScores["accorde"] ?? 0);
  const qName = lang === "en" ? target.q.labelEn : target.q.label;

  const { left, reset } = useCountdown(45, !done, () => setDone(true));

  useEffect(() => {
    if (!done) return;
    addXp(score * 2, "feed.game");
    recordBest("accorde", score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const next = () => {
    setTarget({ root: Math.floor(Math.random() * 12), q: pool[Math.floor(Math.random() * pool.length)] });
    setPicked([]);
    setFlash(null);
  };

  if (done) {
    return (
      <Page>
        <Recap
          score={score}
          total={0}
          onRetry={() => {
            setScore(0);
            setTries(0);
            setDone(false);
            reset();
            next();
          }}
          onBack={() => nav({ to: "/jeux" })}
          perfect={lang === "en" ? "Triads locked in, against the clock." : "Triades en place, contre la montre."}
          ok={lang === "en" ? "Review degrees (1–3–5, 1–♭3–5…) and retry." : "Revois les degrés (1–3–5, 1–♭3–5…) et retente."}
        />
      </Page>
    );
  }

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label={lang === "en" ? "Games" : "Jeux"} />
      <Title kicker={`${left}s · ${score} pts · record ${prevBest}`} lead={lang === "en" ? `${tries} chords tried. A miss clears your pick, not the chord.` : `${tries} accords tentés. Une erreur vide ta sélection, sans perdre l'accord.`}>
        {nn[target.root]} {qName.toLowerCase()} <span className="font-mono text-sm text-subtle">({target.q.degrees})</span>
      </Title>
      {!done && <Urgency left={left} lang={lang} />}
      <p className={cn("mb-3 text-sm", flash === "ko" ? "text-danger" : "text-subtle")}>
        {picked.length} / 3 {lang === "en" ? "notes" : "notes"} {flash === "ko" ? (lang === "en" ? "— miss, retry this chord" : "— raté, recommence cet accord") : ""}
      </p>
      <Fretboard
        activeCells={picked}
        highlight={{ rootIndex: -1, steps: [] }}
        onCellClick={(s, f) => {
          if (flash) return;
          const note = noteAt(s, f);
          const already = picked.some((p) => p.s === s && p.f === f);
          const nextP = already ? picked.filter((p) => !(p.s === s && p.f === f)) : [...picked, { s, f, note }];
          setPicked(nextP);
          if (nextP.length === 3) {
            const a = new Set<number>(nextP.map((p) => (p.note - target.root + 12) % 12));
            const b = new Set<number>([...target.q.formula]);
            const ok = a.size === b.size && [...a].every((v) => b.has(v));
            setTries((t) => t + 1);
            if (ok) {
              setScore((x) => x + 1);
              next();
            } else {
              setFlash("ko");
              window.setTimeout(() => {
                setPicked([]);
                setFlash(null);
              }, 450);
            }
          }
        }}
      />
    </Page>
  );
}

function MissingNote() {
  const scale = SCALES.find((s) => s.id === "majeure")!;
  const [root, setRoot] = useState(0);
  const [missing, setMissing] = useState(2);
  const [fb, setFb] = useState<"ok" | "ko" | null>(null);
  const [score, setScore] = useState(0);
  const [n, setN] = useState(0);
  const total = 5;
  const nav = useNavigate();
  const lang = useLang();
  const nn = useNN();
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const prevBest = useProgress((s) => s.bestScores["trou"] ?? 0);

  const deal = () => {
    const r = Math.floor(Math.random() * 12);
    const miss = scale.steps[1 + Math.floor(Math.random() * (scale.steps.length - 1))];
    setRoot(r);
    setMissing(miss);
    setFb(null);
  };

  useEffect(deal, []);

  const finish = (finalScore: number) => {
    addXp(finalScore * 4, "feed.game");
    recordBest("trou", finalScore);
  };

  const shown = scale.steps.filter((s) => s !== missing);

  if (n >= total) {
    return (
      <Page>
        <Recap
          score={score}
          total={total}
          onRetry={() => {
            setScore(0);
            setN(0);
            deal();
          }}
          onBack={() => nav({ to: "/jeux" })}
          perfect={lang === "en" ? "You see the scale." : "Tu vois la gamme."}
          ok={lang === "en" ? "Listen to the major scale again." : "Écoute encore la majeure."}
        />
      </Page>
    );
  }

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label={lang === "en" ? "Games" : "Jeux"} />
      <Title kicker={`${n + 1} / ${total} · score ${score} · record ${prevBest}/5`} lead={lang === "en" ? `${nn[root]} major scale — click the missing note (6th string).` : `Gamme de ${nn[root]} majeur — clique la note absente (6e corde).`}>
        {lang === "en" ? "Missing note" : "Note manquante"}
      </Title>
      <Fretboard
        highlight={{ rootIndex: root, steps: shown }}
        onCellClick={(s, f) => {
          if (fb || s !== 0) return;
          const deg = (noteAt(s, f) - root + 12) % 12;
          const ok = deg === missing;
          setFb(ok ? "ok" : "ko");
          if (ok) setScore((x) => x + 1);
        }}
      />
      {fb && (
        <div className="mt-4 flex justify-between">
          <span className={fb === "ok" ? "text-sage" : "text-danger"}>
            {fb === "ok"
              ? lang === "en" ? "That was the one." : "C'était bien celle-là."
              : lang === "en" ? `Missing: ${nn[(root + missing) % 12]}.` : `Manquait ${nn[(root + missing) % 12]}.`}
          </span>
          <Button
            onClick={() => {
              const finalScore = score;
              if (n + 1 >= total) finish(finalScore);
              setN((x) => x + 1);
              deal();
            }}
          >
            {lang === "en" ? "Next" : "Suivant"}
          </Button>
        </div>
      )}
    </Page>
  );
}

function Dictee() {
  const ROUNDS = 5;
  const LEN = 4;
  const makeSeq = () => Array.from({ length: LEN }, () => Math.floor(Math.random() * 13));
  const [seq, setSeq] = useState<number[]>(makeSeq);
  const [input, setInput] = useState<number[]>([]);
  const [fb, setFb] = useState<boolean[] | null>(null);
  const [score, setScore] = useState(0);
  const [n, setN] = useState(0);
  const nav = useNavigate();
  const lang = useLang();
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const prevBest = useProgress((s) => s.bestScores["dictee"] ?? 0);

  const deal = () => {
    setSeq(makeSeq());
    setInput([]);
    setFb(null);
  };

  const playSeq = async () => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.06;
    seq.forEach((f, i) => {
      playTone(ctx, freqForOffset(TUNING[0], f), now + i * 0.5, 0.45, 0.16);
    });
  };

  useEffect(() => {
    const t = window.setTimeout(() => void playSeq(), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const finished = n >= ROUNDS;

  if (finished) {
    return (
      <Page>
        <Recap
          score={score}
          total={ROUNDS * LEN}
          onRetry={() => {
            setScore(0);
            setN(0);
            deal();
          }}
          onBack={() => nav({ to: "/jeux" })}
          perfect={lang === "en" ? "Perfect pitch on one string." : "Oreille absolue sur une corde."}
          ok={lang === "en" ? "Sing each note before clicking: voice guides the ear." : "Chante chaque note avant de cliquer : la voix guide l'oreille."}
        />
      </Page>
    );
  }

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label={lang === "en" ? "Games" : "Jeux"} />
      <Title kicker={`${lang === "en" ? "Round" : "Manche"} ${n + 1} / ${ROUNDS} · score ${score} · record ${prevBest}/20`} lead={lang === "en" ? "4 notes played on the 6th string. Play them back in order by clicking frets." : "4 notes jouées sur la 6e corde. Rejoue-les dans l'ordre en cliquant les cases."}>
        {lang === "en" ? "Melodic dictation" : "Dictée mélodique"}
      </Title>
      <div className="mb-4 flex gap-2">
        <Button variant="outline" onClick={playSeq}>
          {lang === "en" ? "Replay" : "Réécouter"}
        </Button>
        <div className="flex items-center gap-1.5">
          {seq.map((_, i) => (
            <span
              key={i}
              className={cn(
                "flex size-8 items-center justify-center rounded-sm border font-mono text-xs",
                fb
                  ? fb[i]
                    ? "border-sage bg-sage-dim text-sage"
                    : "border-danger bg-danger-dim text-danger"
                  : input[i] != null
                    ? "border-gold bg-raised text-gold"
                    : "border-line bg-surface text-subtle",
              )}
            >
              {input[i] != null ? input[i] : "·"}
            </span>
          ))}
        </div>
      </div>
      <Fretboard
        highlight={{ rootIndex: -1, steps: [] }}
        activeCells={input.map((f) => ({ s: 0, f }))}
        onCellClick={(s, f) => {
          if (fb || s !== 0 || input.length >= LEN) return;
          const nextInput = [...input, f];
          setInput(nextInput);
          if (nextInput.length === LEN) {
            const res = nextInput.map((v, i) => v === seq[i]);
            setFb(res);
            setScore((x) => x + res.filter(Boolean).length);
          }
        }}
      />
      {fb && (
        <div className="mt-4 flex justify-between">
          <span className={fb.every(Boolean) ? "text-sage" : "text-muted"}>
            {fb.every(Boolean)
              ? lang === "en" ? "Perfect, all 4 notes." : "Parfait, les 4 notes."
              : lang === "en" ? `Sequence: ${seq.join(" – ")} (frets).` : `Suite : ${seq.join(" – ")} (cases).`}
          </span>
          <Button
            onClick={() => {
              if (n + 1 >= ROUNDS) {
                addXp(score * 2, "feed.game");
                recordBest("dictee", score);
              }
              setN((x) => x + 1);
              deal();
            }}
          >
            {n + 1 >= ROUNDS ? (lang === "en" ? "Result" : "Résultat") : (lang === "en" ? "Next" : "Suivant")}
          </Button>
        </div>
      )}
    </Page>
  );
}

function MinuteGrid() {
  const [left, setLeft] = useState(60);
  const [prog, setProg] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [key] = useState(0);
  const degrees = Array.from({ length: 7 }, (_, i) => degreeChord(key, "majeure", i));
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const prevBest = useProgress((s) => s.bestScores["minute"] ?? 0);
  const nav = useNavigate();
  const lang = useLang();

  useEffect(() => {
    if (done) return;
    if (left <= 0) {
      const pts = prog.length >= 4 ? 40 + 0 : prog.length * 10;
      setScore(pts);
      addXp(pts, "feed.game");
      recordBest("minute", pts);
      setDone(true);
      return;
    }
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, left]);

  useEffect(() => {
    if (prog.length >= 4 && !done) {
      const pts = 40 + left;
      setScore(pts);
      addXp(pts, "feed.game");
      recordBest("minute", pts);
      setDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prog, done]);

  const play = async () => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    prog.forEach((d, i) => {
      const ch = degrees[d];
      ch.quality.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(key, ch.rootOffset + iv), now + i * 0.7, 0.65, 0.12);
      });
    });
  };

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label={lang === "en" ? "Games" : "Jeux"} />
      <Title kicker={`${left}s · record ${prevBest} pts`} lead={lang === "en" ? "Four chords in C major. Click the degrees. Bonus = seconds left." : "Quatre accords en Do majeur. Clique les degrés. Bonus = secondes restantes."}>
        {lang === "en" ? "Minute progression" : "Grille minute"} · {prog.length >= 4 ? score : prog.length}/4
      </Title>
      {!done && <Urgency left={left} lang={lang} />}
      <div className="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {degrees.map((ch, i) => (
          <button
            key={i}
            type="button"
            disabled={done}
            onClick={() => setProg((p) => (p.length < 4 ? [...p, i] : p))}
            className="rounded-md border border-line bg-surface py-3"
          >
            <span className="font-display text-gold">{ch.numeral}</span>
          </button>
        ))}
      </div>
      <p className="mb-4 font-mono text-sm text-muted">
        {prog.map((d) => degrees[d].numeral).join(" – ") || "—"}
      </p>
      {done && (
        <div className="flex gap-2">
          <Button onClick={play} disabled={prog.length === 0}>
            {lang === "en" ? "Listen" : "Écouter"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setProg([]);
              setScore(0);
              setLeft(60);
              setDone(false);
            }}
          >
            {lang === "en" ? "Replay" : "Rejouer"}
          </Button>
        </div>
      )}
    </Page>
  );
}

function Compo60() {
  const [left, setLeft] = useState(60);
  const [prog, setProg] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const [key] = useState(0);
  const degrees = Array.from({ length: 7 }, (_, i) => degreeChord(key, "majeure", i));
  const addXp = useProgress((s) => s.addXp);
  const recordBest = useProgress((s) => s.recordBest);
  const savePiece = useProgress((s) => s.savePiece);
  const prevBest = useProgress((s) => s.bestScores["compo60"] ?? 0);
  const nav = useNavigate();
  const lang = useLang();
  const nn = useNN();

  useEffect(() => {
    if (done) return;
    if (left <= 0) {
      const pts = prog.length >= 4 ? 40 : prog.length * 10;
      setScore(pts);
      addXp(pts, "feed.game");
      recordBest("compo60", pts);
      setDone(true);
      return;
    }
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, left]);

  const finishNow = () => {
    if (done || prog.length < 4) return;
    const pts = 40 + left;
    setScore(pts);
    addXp(pts, "feed.game");
    recordBest("compo60", pts);
    setDone(true);
  };

  const play = async () => {
    const ctx = await resumeAudio();
    const now = ctx.currentTime + 0.05;
    prog.forEach((d, i) => {
      const ch = degrees[d];
      ch.quality.formula.forEach((iv) => {
        playTone(ctx, freqForOffset(key, ch.rootOffset + iv), now + i * 0.7, 0.65, 0.12);
      });
    });
  };

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label={lang === "en" ? "Games" : "Jeux"} />
      <Title kicker={`${left}s · record ${prevBest} pts`} lead={lang === "en" ? "C major, 4 chords, a title. Finish before the gong for the time bonus." : "Do majeur, 4 accords, un titre. Termine avant le gong pour le bonus de temps."}>
        {lang === "en" ? "60-second composition" : "Composition en 60 secondes"} {done ? `· ${score} pts` : ""}
      </Title>
      {!done && <Urgency left={left} lang={lang} />}
      {!done && (
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-gold transition-all" style={{ width: `${(left / 60) * 100}%` }} />
        </div>
      )}
      <div className="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {degrees.map((ch, i) => (
          <button
            key={i}
            type="button"
            disabled={done}
            onClick={() => setProg((p) => (p.length < 4 ? [...p, i] : p))}
            className="rounded-md border border-line bg-surface py-3"
          >
            <span className="font-display text-gold">{ch.numeral}</span>
            <span className="block font-mono text-[11px] text-subtle">
              {nn[ch.rootNoteIndex]}
              {ch.quality.suffix}
            </span>
          </button>
        ))}
      </div>
      <p className="mb-4 font-mono text-sm text-muted">
        {prog.map((d) => degrees[d].numeral).join(" – ") || "—"}
      </p>
      {!done ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-subtle">
            {lang === "en" ? "Title" : "Titre"}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === "en" ? "My express riff" : "Mon riff express"}
              className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-fg"
            />
          </label>
          <Button onClick={finishNow} disabled={prog.length < 4}>
            {lang === "en" ? "Finish" : "Terminer"} ({prog.length}/4)
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm text-muted">
            {prog.length >= 4
              ? lang === "en" ? "Progression wrapped in time." : "Grille bouclée dans les temps."
              : lang === "en" ? "Gong! Incomplete progression, but playable." : "Gong ! Grille incomplète, mais écoutable."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={play} disabled={prog.length === 0}>
              {lang === "en" ? "Listen" : "Écouter"}
            </Button>
            <Button
              variant="outline"
              disabled={saved || prog.length < 4}
              onClick={() => {
                savePiece({
                  title: title || (lang === "en" ? "Express riff" : "Riff express"),
                  keyRoot: key,
                  mode: "majeure",
                  progression: prog,
                  melody: Array(8).fill(null),
                  genre: "rock",
                });
                setSaved(true);
              }}
            >
              {saved ? (lang === "en" ? "In journal ✓" : "Au carnet ✓") : lang === "en" ? "Save to journal" : "Sauver au carnet"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setProg([]);
                setScore(0);
                setTitle("");
                setSaved(false);
                setLeft(60);
                setDone(false);
              }}
            >
              {lang === "en" ? "Replay" : "Rejouer"}
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}
