import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Flame, Star, Target } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { Page } from "@/features/page";
import { LESSONS, LESSON_ORDER, PHASES, lessonById } from "@/lib/curriculum";
import { dailyChallenge } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const completed = useProgress((s) => s.completed);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const percent = useProgress((s) => s.percent());
  const onboarded = useProgress((s) => s.onboarded);
  const setOnboarded = useProgress((s) => s.setOnboarded);
  const isUnlocked = useProgress((s) => s.isUnlocked);
  const nav = useNavigate();
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    if (!onboarded) setShowOnboard(true);
  }, [onboarded]);

  const nextId = LESSON_ORDER.find((id) => !completed.includes(id)) ?? LESSON_ORDER[0];
  const next = lessonById(nextId);
  const level = useProgress((s) => s.level);
  const defi = dailyChallenge();
  const defiDone = useProgress((s) => s.challenges[defi.seed] ?? 0);

  return (
    <Page>
      {showOnboard && (
        <div className="mb-8 rounded-lg border border-line bg-surface p-6">
          <p className="m-0 font-mono text-xs tracking-widest text-gold uppercase">Bienvenue</p>
          <h2 className="mt-2 mb-2 font-display text-2xl">De zéro à compositeur, une leçon à la fois.</h2>
          <p className="mb-4 max-w-lg text-sm leading-relaxed text-muted">
            Diapason t'accompagne sur le manche : notes, intervalles, accords, gammes, puis composition par genres.
            Chaque concept se joue, s'écoute, et se teste.
          </p>
          <Button
            onClick={() => {
              setOnboarded();
              setShowOnboard(false);
              nav({ to: "/lecon/$id", params: { id: "notes" } });
            }}
          >
            Commencer par les notes
          </Button>
        </div>
      )}

      <p className="m-0 font-mono text-xs tracking-widest text-gold uppercase">
        {PHASES[(next?.phase ?? 1) - 1]?.title}
      </p>
      <h1 className="mt-1 mb-2 font-display text-3xl font-medium tracking-tight md:text-4xl">
        Le manche, la théorie, la composition.
      </h1>
      <p className="mb-8 max-w-xl text-base leading-relaxed text-muted">
        {next ? `Prochaine étape : ${next.title.toLowerCase()}.` : "Parcours terminé. Compose et affine ton oreille."}
      </p>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <Stat icon={<Flame size={16} />} label="Série" value={`${streak} j`} />
        <Stat icon={<Star size={16} />} label="Expérience" value={`${xp} XP`} />
        <Stat icon={<Target size={16} />} label="Parcours" value={`${percent} %`} />
      </div>

      {next && isUnlocked(next.id) && (
        <Card className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 font-mono text-xs text-subtle">Leçon en cours</p>
            <p className="m-0 font-display text-lg">{next.title}</p>
          </div>
          <Link
            to="/lecon/$id"
            params={{ id: next.id }}
            className="inline-flex items-center gap-1 rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg no-underline"
          >
            Continuer <ChevronRight size={16} />
          </Link>
        </Card>
      )}

      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        <Link to="/defi" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
          <p className="m-0 font-mono text-xs text-subtle">Défi du jour · {defi.label}</p>
          <p className="m-0 font-display text-lg">{defiDone > 0 ? `Fait à ${defiDone} % — retenter ?` : "5 questions, même seed pour tous"}</p>
        </Link>
        {!level && (
          <Link to="/diagnostic" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
            <p className="m-0 font-mono text-xs text-subtle">Diagnostic</p>
            <p className="m-0 font-display text-lg">Calibrer mon niveau en 2 minutes</p>
          </Link>
        )}
        <Link to="/studio" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
          <p className="m-0 font-mono text-xs text-subtle">Studio</p>
          <p className="m-0 font-display text-lg">Compose une grille et une mélodie</p>
        </Link>
        <Link to="/oreille" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
          <p className="m-0 font-mono text-xs text-subtle">Oreille</p>
          <p className="m-0 font-display text-lg">Intervalles, accords, grilles, modes</p>
        </Link>
        <Link to="/jeux" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
          <p className="m-0 font-mono text-xs text-subtle">Jeux</p>
          <p className="m-0 font-display text-lg">S'entraîner sans leçon</p>
        </Link>
        <Link to="/manche" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
          <p className="m-0 font-mono text-xs text-subtle">Explorer</p>
          <p className="m-0 font-display text-lg">Manche interactif</p>
        </Link>
        <Link to="/examens" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
          <p className="m-0 font-mono text-xs text-subtle">Examens</p>
          <p className="m-0 font-display text-lg">Valider chaque phase à 60 %</p>
        </Link>
        <Link to="/progression" className="rounded-lg border border-line bg-surface p-5 text-fg no-underline">
          <p className="m-0 font-mono text-xs text-subtle">Progrès</p>
          <p className="m-0 font-display text-lg">Badges, titre, mastery</p>
        </Link>
      </div>

      <h2 className="mb-4 font-display text-xl">Aperçu du parcours</h2>
      {PHASES.map((phase) => (
        <div key={phase.id} className="mb-6">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-mono text-xs text-gold">Phase {phase.id}</span>
            <span className="text-sm">{phase.title}</span>
            <span className="ml-auto font-mono text-xs text-subtle">{phase.range}</span>
          </div>
          <ul className="m-0 list-none border-l border-line pl-5">
            {LESSONS.filter((l) => l.phase === phase.id).map((m) => {
              const done = completed.includes(m.id);
              return (
                <li key={m.id} className="py-1.5 text-sm text-muted">
                  <Link to="/lecon/$id" params={{ id: m.id }} className="text-inherit no-underline hover:text-fg">
                    {done ? "●" : "○"} {m.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </Page>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <div className="mb-2 text-gold">{icon}</div>
      <p className="m-0 font-mono text-[11px] text-subtle">{label}</p>
      <p className="m-0 font-display text-lg">{value}</p>
    </div>
  );
}
