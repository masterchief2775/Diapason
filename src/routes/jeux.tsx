import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Title } from "@/features/page";

export const Route = createFileRoute("/jeux")({ component: GamesHub });

const GAMES = [
  {
    id: "intervalles",
    title: "Course d'intervalles",
    blurb: "Sur la corde de Mi grave, vise la bonne case contre la montre.",
  },
  {
    id: "accorde",
    title: "Constructeur d'accords",
    blurb: "Trois notes, n'importe où sur le manche, pour former la triade.",
  },
  {
    id: "trou",
    title: "Note manquante",
    blurb: "Une gamme avec un trou. Quelle case manque ?",
  },
  {
    id: "minute",
    title: "Grille en 60 secondes",
    blurb: "Empile 4 accords diatoniques avant la fin du sablier.",
  },
];

function GamesHub() {
  return (
    <Page>
      <Title kicker="Jeux" lead="Même matière que les leçons, rythme plus sec. Idéal pour réviser.">
        Salle d'entraînement
      </Title>
      <div className="grid gap-3">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            to="/jeux/$id"
            params={{ id: g.id }}
            className="rounded-lg border border-line bg-surface p-5 text-fg no-underline"
          >
            <p className="m-0 font-display text-lg">{g.title}</p>
            <p className="mt-1 mb-0 text-sm text-muted">{g.blurb}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}
