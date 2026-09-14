import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { BackLink, Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { Recap } from "@/features/quiz-block";
import { resumeAudio, playTone, freqForOffset } from "@/lib/audio";
import { CHORD_QUALITIES, INTERVALS, NOTES, SCALES, TUNING, degreeChord, noteAt } from "@/lib/music";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/jeux/$id")({
  component: GameRoute,
});

function GameRoute() {
  const { id } = Route.useParams();
  if (id === "intervalles") return <IntervalRace />;
  if (id === "accorde") return <ChordRace />;
  if (id === "trou") return <MissingNote />;
  if (id === "minute") return <MinuteGrid />;
  return (
    <Page>
      <p>Jeu introuvable.</p>
    </Page>
  );
}

function IntervalRace() {
  const [q, setQ] = useState<(typeof INTERVALS)[number]>(INTERVALS[4]);
  const [left, setLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const addXp = useProgress((s) => s.addXp);
  const nav = useNavigate();

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setDone(true);
          addXp(score);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done, score, addXp]);

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label="Jeux" />
      <Title kicker={`${left}s`} lead="Clique la case sur la 6e corde.">
        Course d'intervalles · {score} pts
      </Title>
      {!done ? (
        <>
          <h2 className="mb-4 font-display text-xl">{q.label}</h2>
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
            setLeft(30);
            setDone(false);
          }}
          onBack={() => nav({ to: "/jeux" })}
          perfect="Rapide et juste."
          ok="Le tempo reviendra."
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
  const [score, setScore] = useState(0);
  const [n, setN] = useState(0);
  const nav = useNavigate();
  const addXp = useProgress((s) => s.addXp);
  const total = 5;

  const next = () => {
    setTarget({ root: Math.floor(Math.random() * 12), q: pool[Math.floor(Math.random() * pool.length)] });
    setPicked([]);
  };

  if (n >= total) {
    return (
      <Page>
        <Recap
          score={score}
          total={total}
          onRetry={() => {
            setScore(0);
            setN(0);
            next();
          }}
          onBack={() => nav({ to: "/jeux" })}
          perfect="Triades en place."
          ok="Continue."
        />
      </Page>
    );
  }

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label="Jeux" />
      <Title kicker={`${n + 1} / ${total}`}>
        {NOTES[target.root]} {target.q.label.toLowerCase()}
      </Title>
      <Fretboard
        activeCells={picked}
        highlight={{ rootIndex: -1, steps: [] }}
        onCellClick={(s, f) => {
          const note = noteAt(s, f);
          const already = picked.some((p) => p.s === s && p.f === f);
          const nextP = already ? picked.filter((p) => !(p.s === s && p.f === f)) : [...picked, { s, f, note }];
          setPicked(nextP);
          if (nextP.length === 3) {
            const a = new Set<number>(nextP.map((p) => (p.note - target.root + 12) % 12));
            const b = new Set<number>([...target.q.formula]);
            const ok = a.size === b.size && [...a].every((v) => b.has(v));
            if (ok) setScore((x) => x + 1);
            if (n + 1 >= total) addXp(ok ? (score + 1) * 4 : score * 4);
            setN((x) => x + 1);
            next();
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
  const addXp = useProgress((s) => s.addXp);

  const deal = () => {
    const r = Math.floor(Math.random() * 12);
    const miss = scale.steps[1 + Math.floor(Math.random() * (scale.steps.length - 1))];
    setRoot(r);
    setMissing(miss);
    setFb(null);
  };

  useEffect(deal, []);

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
          perfect="Tu vois la gamme."
          ok="Écoute encore la majeure."
        />
      </Page>
    );
  }

  return (
    <Page>
      <BackLink onClick={() => nav({ to: "/jeux" })} label="Jeux" />
      <Title kicker={`${n + 1} / ${total}`} lead={`Gamme de ${NOTES[root]} majeur — clique la note absente (6e corde).`}>
        Note manquante
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
            {fb === "ok" ? "C'était bien celle-là." : `Manquait ${NOTES[(root + missing) % 12]}.`}
          </span>
          <Button
            onClick={() => {
              if (n + 1 >= total) addXp(score * 4);
              setN((x) => x + 1);
              deal();
            }}
          >
            Suivant
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
  const [key] = useState(0);
  const degrees = Array.from({ length: 7 }, (_, i) => degreeChord(key, "majeure", i));
  const addXp = useProgress((s) => s.addXp);
  const nav = useNavigate();

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (prog.length >= 4 && !done) {
      setDone(true);
      addXp(20);
    }
  }, [prog, done, addXp]);

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
      <BackLink onClick={() => nav({ to: "/jeux" })} label="Jeux" />
      <Title kicker={`${left}s`} lead="Quatre accords en Do majeur. Clique les degrés.">
        Grille minute
      </Title>
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
            Écouter
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setProg([]);
              setLeft(60);
              setDone(false);
            }}
          >
            Rejouer
          </Button>
        </div>
      )}
    </Page>
  );
}


