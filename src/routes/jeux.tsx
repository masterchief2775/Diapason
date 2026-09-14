import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Page, Title } from "@/features/page";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/jeux")({ component: GamesLayout });

/** La route parente doit rendre <Outlet/> sinon /jeux/$id ne s'affiche jamais. */
function GamesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/jeux" && pathname !== "/jeux/") return <Outlet />;
  return <GamesHub />;
}

export const GAMES = [
  {
    id: "intervalles",
    title: "Course d'intervalles",
    blurb: "Sur la corde de Mi grave, vise la bonne case en 30 secondes.",
    unit: " pts",
  },
  {
    id: "accorde",
    title: "Constructeur d'accords",
    blurb: "Forme un max de triades en 45 secondes, n'importe où sur le manche.",
    unit: " pts",
  },
  {
    id: "trou",
    title: "Note manquante",
    blurb: "Une gamme avec un trou. Quelle case manque ? 5 manches.",
    unit: "/5",
  },
  {
    id: "dictee",
    title: "Dictée mélodique",
    blurb: "Écoute 4 notes sur une corde, rejoue-les case par case.",
    unit: "/20",
  },
  {
    id: "minute",
    title: "Grille en 60 secondes",
    blurb: "Empile 4 accords diatoniques avant la fin du sablier.",
    unit: " pts",
  },
  {
    id: "compo60",
    title: "Composition en 60 secondes",
    blurb: "Une grille + un titre en 1 minute, écoutée et sauvegardée.",
    unit: " pts",
  },
];

function GamesHub() {
  const best = useProgress((s) => s.bestScores);
  const entries = GAMES.filter((g) => best[g.id] != null).sort((a, b) => (best[b.id] ?? 0) - (best[a.id] ?? 0));

  return (
    <Page>
      <Title kicker="Jeux" lead="Même matière que les leçons, rythme plus sec. Tes records restent sur cet appareil.">
        Salle d'entraînement
      </Title>
      {entries.length > 0 && (
        <div className="mb-6 rounded-lg border border-line bg-raised p-5">
          <p className="m-0 mb-3 font-mono text-xs tracking-widest text-gold uppercase">Records locaux</p>
          <div className="flex flex-col gap-1.5">
            {entries.map((g, i) => (
              <div key={g.id} className="flex items-baseline gap-2 text-sm">
                <span className="font-mono text-xs text-subtle">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                <span className="min-w-0 flex-1 truncate text-muted">{g.title}</span>
                <span className="font-mono text-xs text-gold">
                  {best[g.id]}{g.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-3">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            to="/jeux/$id"
            params={{ id: g.id }}
            className="flex items-center gap-3 rounded-lg border border-line bg-surface p-5 text-fg no-underline"
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 font-display text-lg">{g.title}</p>
              <p className="mt-1 mb-0 text-sm text-muted">{g.blurb}</p>
            </div>
            {best[g.id] != null && (
              <span className="shrink-0 rounded-sm border border-line bg-bg px-2 py-1 font-mono text-xs text-gold">
                {best[g.id]}{g.unit}
              </span>
            )}
          </Link>
        ))}
      </div>
    </Page>
  );
}
