import { createFileRoute } from "@tanstack/react-router";
import { Page, Title } from "@/features/page";
import { LESSONS } from "@/lib/curriculum";
import { BADGES, earnedBadges, titleFor } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/progression")({ component: ProgressionPage });

function ProgressionPage() {
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const pieces = useProgress((s) => s.pieces);
  const challenges = useProgress((s) => s.challenges);
  const level = useProgress((s) => s.level);

  const earned = earnedBadges({ xp, streak, completed: completed.length, pieces: pieces.length, scores });
  const earnedIds = new Set(earned.map((b) => b.id));
  const title = titleFor({ completed: completed.length, xp });
  const avg = (() => {
    const vals = Object.values(scores);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  })();

  return (
    <Page>
      <Title kicker={level ? `Diagnostic : ${level}` : "Suivi"} lead={`Titre actuel : ${title}. Moyenne quiz : ${avg} %. Défis relevés : ${Object.keys(challenges).length}.`}>
        Ta progression
      </Title>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="m-0 font-mono text-[11px] text-subtle">XP</p>
          <p className="m-0 font-display text-lg">{xp}</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="m-0 font-mono text-[11px] text-subtle">Série</p>
          <p className="m-0 font-display text-lg">{streak} j</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="m-0 font-mono text-[11px] text-subtle">Leçons</p>
          <p className="m-0 font-display text-lg">{completed.length}/{LESSONS.length}</p>
        </div>
      </div>

      <h2 className="mb-3 font-display text-xl">Badges ({earned.length}/{BADGES.length})</h2>
      <div className="mb-10 grid gap-2 sm:grid-cols-2">
        {BADGES.map((b) => {
          const has = earnedIds.has(b.id);
          return (
            <div key={b.id} className="rounded-md border border-line bg-surface p-4" style={{ opacity: has ? 1 : 0.45 }}>
              <p className="m-0 text-sm font-medium">{has ? "●" : "○"} {b.title}</p>
              <p className="mt-1 mb-0 text-xs text-subtle">{b.desc}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 font-display text-xl">Maîtrise par leçon</h2>
      <div className="flex flex-col gap-1.5">
        {LESSONS.map((l) => {
          const sc = scores[l.id];
          const done = completed.includes(l.id);
          return (
            <div key={l.id} className="flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm">{l.title}</span>
              <span className="font-mono text-xs text-subtle">{done ? (sc != null ? `${sc} %` : "validé") : "—"}</span>
              <span className="flex gap-0.5" aria-label={done ? "maîtrisé" : "à faire"}>
                {[0, 1, 2].map((s) => (
                  <span
                    key={s}
                    className="inline-block size-2 rounded-full"
                    style={{ background: sc != null && sc >= (s + 1) * 33 ? "#d4c4a0" : "#2e2620" }}
                  />
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
