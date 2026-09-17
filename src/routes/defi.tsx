import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock, Recap } from "@/features/quiz-block";
import { QUIZZES, quizFor } from "@/lib/curriculum";
import { challengeText, dailyChallenge } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";

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
  const t = useT();
  const lang = useLang();
  const challenge = dailyChallenge();
  const recordChallenge = useProgress((s) => s.recordChallenge);
  const done = useProgress((s) => s.challenges[challenge.seed] ?? 0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "recap">("intro");
  const [pct, setPct] = useState(0);
  const [label, detail] = challengeText(lang, challenge.kind);

  const questions = useMemo(() => {
    if (lang === "en") {
      const ids = Object.keys(QUIZZES);
      return seeded(
        ids.flatMap((id) => quizFor("en", id)),
        challenge.seed,
        5,
      );
    }
    const pool = Object.values(QUIZZES).flat();
    return seeded(pool, challenge.seed, 5);
  }, [challenge.seed, lang]);

  if (phase === "intro") {
    return (
      <Page>
        <Title
          kicker={`${lang === "en" ? "Daily challenge" : "Défi du jour"} · ${challenge.seed}`}
          lead={lang === "en" ? "5 mixed questions, seeded by date. Same challenge for everyone, every day." : "5 questions mélangées, seedées par la date. Même défi pour tout le monde, chaque jour."}
        >
          {label}
        </Title>
        <p className="mb-2 text-sm text-muted">{detail}</p>
        {done > 0 && (
          <p className="mb-6 font-mono text-xs text-sage">
            {lang === "en" ? `Already tried today: ${done} %` : `Déjà tenté aujourd'hui : ${done} %`}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={() => setPhase("quiz")}>{done > 0 ? t("ui.retry") : lang === "en" ? "Take the challenge" : "Relever le défi"}</Button>
          <Button variant="outline" onClick={() => nav({ to: "/" })}>{lang === "en" ? "Home" : "Accueil"}</Button>
        </div>
      </Page>
    );
  }

  if (phase === "quiz") {
    return (
      <Page>
        <Title kicker={`${lang === "en" ? "Challenge" : "Défi"} · ${challenge.seed}`}>{label}</Title>
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
        perfect={lang === "en" ? "Daily challenge done. Come back tomorrow to keep the streak." : "Défi du jour plié. Reviens demain pour garder la série."}
        ok={lang === "en" ? "No harm: the challenge stays open all day, retry it." : "Pas grave : le défi reste dispo toute la journée, retente-le."}
      />
    </Page>
  );
}
