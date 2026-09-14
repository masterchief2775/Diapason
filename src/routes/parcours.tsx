import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { Page, Title } from "@/features/page";
import { LESSONS, LESSON_ORDER, PHASES } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/parcours")({ component: Parcours });

function Parcours() {
  const completed = useProgress((s) => s.completed);
  const isUnlocked = useProgress((s) => s.isUnlocked);
  const scores = useProgress((s) => s.scores);
  const current = LESSON_ORDER.find((id) => !completed.includes(id));

  return (
    <Page>
      <Title kicker="Guidé" lead="Chaque leçon débloque la suivante. 60 % suffisent pour avancer.">
        Parcours 0 → 100 %
      </Title>
      {PHASES.map((phase) => (
        <section key={phase.id} className="mb-10">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="font-mono text-xs text-gold">Phase {phase.id}</span>
            <h2 className="m-0 font-display text-xl">{phase.title}</h2>
            <span className="ml-auto font-mono text-xs text-subtle">{phase.range}</span>
          </div>
          <div className="flex flex-col gap-2">
            {LESSONS.filter((l) => l.phase === phase.id).map((m) => {
              const done = completed.includes(m.id);
              const open = isUnlocked(m.id);
              const currentOne = m.id === current;
              return (
                <Link
                  key={m.id}
                  to="/lecon/$id"
                  params={{ id: m.id }}
                  className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 text-fg no-underline"
                >
                  {done && <CheckCircle2 size={16} className="text-sage" />}
                  {currentOne && !done && <Sparkles size={16} className="text-gold" />}
                  {!open && <Lock size={14} className="text-subtle" />}
                  {open && !done && !currentOne && <span className="size-4 rounded-full border border-line" />}
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-sm">{m.title}</p>
                    <p className="m-0 truncate text-xs text-subtle">{m.summary}</p>
                  </div>
                  {scores[m.id] != null && (
                    <span className="font-mono text-xs text-sage">{scores[m.id]}%</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </Page>
  );
}
