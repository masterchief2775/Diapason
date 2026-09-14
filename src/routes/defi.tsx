import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { QUIZZES } from "@/lib/curriculum";
import { dailyChallenge } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/defi")({ component: DefiPage });

function seeded<T>(arr: T[], seed: string, n: number): T[] {
  let h = 0;
  for (const c of seed) h = (h * 33 + c.charCodeAt(0)) % 100000;
  const a = [...arr];
  const rand = () => {
    h = (h * 1103515245 + 12345) % 2147483648;
    return h / 2147483648;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function DefiPage() {
  const nav = useNavigate();
  const challenge = dailyChallenge();
  const recordChallenge = useProgress((s) => s.recordChallenge);
  const done = useProgress((s) => s.challenges[challenge.seed] ?? 0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "recap">("intro");
  const [pct, setPct] = useState(0);

  const questions = useMemo(() => {
    const pool = Object.values(QUIZZES).flat();
    return seeded(pool, challenge.seed, 5);
  }, [challenge.seed]);

  if (phase === "intro") {
    return (
      <Page>
        <Title kicker={`Défi du jour · ${challenge.seed}`} lead="5 questions mélangées, seedées par la date. Même défi pour tout le monde, chaque jour.">
          {challenge.label}
        </Title>
        <p className="mb-2 text-sm text-muted">{challenge.detail}</p>
        {done > 0 && <p className="mb-6 font-mono text-xs text-sage">Déjà tenté aujourd'hui : {done} %</p>}
        <div className="flex gap-2">
          <Button onClick={() => setPhase("quiz")}>{done > 0 ? "Retenter" : "Relever le défi"}</Button>
          <Button variant="outline" onClick={() => nav({ to: "/" })}>Accueil</Button>
        </div>
      </Page>
    );
  }

  if (phase === "quiz") {
    return (
      <Page>
        <Title kicker={`Défi · ${challenge.seed}`}>{challenge.label}</Title>
        <QuizBlock
          questions={questions}
          onDone={(p) => {
            setPct(p);
            recordChallenge(challenge.seed, Math.round(p / 10));
            setPhase("recap");
          }}
        />
      </Page>
    );
  }

  return (
    <Page>
      <Recap
        score={pct}
        total={0}
        onRetry={() => setPhase("quiz")}
        onBack={() => nav({ to: "/" })}
        perfect="Défi du jour plié. Reviens demain pour garder la série."
        ok="Pas grave : le défi reste dispo toute la journée, retente-le."
      />
    </Page>
  );
}
