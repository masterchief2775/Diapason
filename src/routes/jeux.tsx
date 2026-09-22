import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AudioLines, ChevronRight, Dices, Hourglass, Shapes, Sparkles, Wand2 } from "lucide-react";
import { Page, Title } from "@/features/page";
import { useProgress } from "@/lib/progress";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/jeux")({ component: GamesLayout });

/** La route parente doit rendre <Outlet/> sinon /jeux/$id ne s'affiche jamais. */
function GamesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/jeux" && pathname !== "/jeux/") return <Outlet />;
  return <GamesHub />;
}

/** Catalogue des jeux (interne à la route ; le hub le rend ci-dessous). */
const GAMES = [
  {
    id: "intervalles",
    icon: "dices",
    title: "Course d'intervalles",
    titleEn: "Interval race",
    blurb: "Sur la corde de Mi grave, vise la bonne case en 30 secondes.",
    blurbEn: "On the low E string, hit the right fret in 30 seconds.",
    unit: " pts",
  },
  {
    id: "accorde",
    icon: "shapes",
    title: "Constructeur d'accords",
    titleEn: "Chord builder",
    blurb: "Forme un max de triades en 45 secondes, n'importe où sur le manche.",
    blurbEn: "Build as many triads as you can in 45 seconds, anywhere on the neck.",
    unit: " pts",
  },
  {
    id: "trou",
    icon: "puzzle",
    title: "Note manquante",
    titleEn: "Missing note",
    blurb: "Une gamme avec un trou. Quelle case manque ? 5 manches.",
    blurbEn: "A scale with a hole. Which fret is missing? 5 rounds.",
    unit: "/5",
  },
  {
    id: "dictee",
    icon: "audio",
    title: "Dictée mélodique",
    titleEn: "Melodic dictation",
    blurb: "Écoute 4 notes sur une corde, rejoue-les case par case.",
    blurbEn: "Hear 4 notes on one string, play them back fret by fret.",
    unit: "/20",
  },
  {
    id: "minute",
    icon: "hourglass",
    title: "Grille en 60 secondes",
    titleEn: "60-second progression",
    blurb: "Empile 4 accords diatoniques avant la fin du sablier.",
    blurbEn: "Stack 4 diatonic chords before the timer runs out.",
    unit: " pts",
  },
  {
    id: "compo60",
    icon: "wand",
    title: "Composition en 60 secondes",
    titleEn: "60-second composition",
    blurb: "Une grille + un titre en 1 minute, écoutée et sauvegardée.",
    blurbEn: "A progression + a title in 1 minute, heard and saved.",
    unit: " pts",
  },
];

const ICONS: Record<string, typeof Dices> = {
  dices: Dices,
  shapes: Shapes,
  puzzle: Sparkles,
  audio: AudioLines,
  hourglass: Hourglass,
  wand: Wand2,
};

function GamesHub() {
  const lang = useLang();
  const best = useProgress((s) => s.bestScores);
  const entries = GAMES.filter((g) => best[g.id] != null).sort((a, b) => (best[b.id] ?? 0) - (best[a.id] ?? 0));
  const gTitle = (g: (typeof GAMES)[number]) => (lang === "en" ? g.titleEn : g.title);

  return (
    <Page>
      <Title
        kicker={lang === "en" ? "Games" : "Jeux"}
        lead={
          lang === "en"
            ? "Same material as lessons, at higher tempo. Your records stay on this device."
            : "Même matière que les leçons, rythme plus sec. Tes records restent sur cet appareil."
        }
      >
        {lang === "en" ? "Training room" : "Salle d'entraînement"}
      </Title>
      {entries.length > 0 && (
        <div className="mb-6 rounded-lg border border-line bg-raised p-5">
          <p className="m-0 mb-3 font-mono text-xs tracking-widest text-gold uppercase">
            {lang === "en" ? "Local records" : "Records locaux"}
          </p>
          <div className="flex flex-col gap-1.5">
            {entries.map((g, i) => (
              <div key={g.id} className="flex items-baseline gap-2 text-sm">
                <span className="font-mono text-xs text-subtle">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                <span className="min-w-0 flex-1 truncate text-muted">{gTitle(g)}</span>
                <span className="font-mono text-xs text-gold">
                  {best[g.id]}{g.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((g) => {
          const Icon = ICONS[g.icon] ?? Dices;
          return (
            <Link
              key={g.id}
              to="/jeux/$id"
              params={{ id: g.id }}
              className="card-lift group flex min-w-0 items-center gap-4 rounded-xl border border-line bg-surface p-5 text-fg no-underline"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-raised text-gold transition-colors group-hover:border-gold">
                <Icon size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="m-0 flex items-center gap-2 font-display text-lg leading-snug">
                  <span>{gTitle(g)}</span>
                  {best[g.id] != null && (
                    <span className="shrink-0 rounded-full border border-gold/50 bg-raised px-2 py-0.5 font-mono text-[11px] text-gold">
                      {best[g.id]}{g.unit}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">{lang === "en" ? g.blurbEn : g.blurb}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
