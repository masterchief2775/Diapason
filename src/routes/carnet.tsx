import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { resumeAudio, playTone, freqForOffset } from "@/lib/audio";
import { degreeChord } from "@/lib/music";
import { GENRES } from "@/lib/music";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProgress } from "@/lib/progress";
import { useLang, useNN, useT } from "@/lib/i18n";

export const Route = createFileRoute("/carnet")({ component: JournalPage });

async function loadGallery() {
  return import("@/lib/cloud-gallery");
}

function JournalPage() {
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const pieces = useProgress((s) => s.pieces);
  const deletePiece = useProgress((s) => s.deletePiece);
  const { isPending } = useCurrentUserState();
  const userId = useCurrentUserState().user?.id;
  const [published, setPublished] = useState<Set<string>>(new Set());
  // Garde anti-chevauchement : un seul Écouter à la fois.
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (playTimer.current !== null) window.clearTimeout(playTimer.current);
  }, []);

  useEffect(() => {
    if (isPending || !userId) return;
    loadGallery()
      .then((m) => m.myPublishedIds())
      .then((ids) => setPublished((prev) => {
        if (prev.size === ids.length && ids.every((id) => prev.has(id))) return prev;
        return new Set(ids);
      }))
      .catch(() => {});
  }, [isPending, userId]);

  return (
    <Page>
      <Title
        kicker={lang === "en" ? "Journal" : "Carnet"}
        lead={
          lang === "en"
            ? "Your progressions saved from the studio. They stay on this device."
            : "Tes grilles enregistrées depuis le studio. Elles restent sur cet appareil."
        }
      >
        {lang === "en" ? "Compositions" : "Compositions"}
      </Title>
      {pieces.length === 0 ? (
        <EmptyState
          icon={<NotebookPen size={20} />}
          title={lang === "en" ? "No pieces yet" : "Rien pour l'instant"}
          hint={
            lang === "en"
              ? "Open the studio, lay down four chords, save — your journal starts here."
              : "Ouvre le studio, pose quatre accords, enregistre — ton carnet commence ici."
          }
          action={
            <Link to="/studio" className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg no-underline shadow-sm">
              <Plus size={15} /> {lang === "en" ? "Open the studio" : "Ouvrir le studio"}
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pieces.map((p) => (
            <div key={p.id} className="panel-sheen rounded-xl border border-line bg-surface p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 font-display text-lg">{p.title}</p>
                  <p className="mt-1 mb-0 font-mono text-xs text-subtle">
                    {nn[p.keyRoot]} {p.mode === "majeure" ? (lang === "en" ? "major" : "majeure") : lang === "en" ? "minor" : "mineure"}
                    {p.genre ? ` · ${(() => { const g = GENRES.find((x) => x.id === p.genre); return g ? (lang === "en" ? g.labelEn : g.label) : p.genre; })()}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={playingId !== null}
                    onClick={async () => {
                      if (playingId !== null) return;
                      setPlayingId(p.id);
                      const ctx = await resumeAudio();
                      const now = ctx.currentTime + 0.05;
                      const steps = p.mode === "majeure" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
                      p.progression.forEach((d, i) => {
                        const ch = degreeChord(p.keyRoot, p.mode, d);
                        ch.quality.formula.forEach((iv) => {
                          playTone(ctx, freqForOffset(p.keyRoot, ch.rootOffset + iv), now + i * 0.8, 0.75, 0.1);
                        });
                        const m = p.melody[i];
                        if (m != null && steps[m] != null) {
                          playTone(ctx, freqForOffset(p.keyRoot, steps[m] + 12), now + i * 0.8, 0.7, 0.16);
                        }
                      });
                      if (playTimer.current !== null) window.clearTimeout(playTimer.current);
                      playTimer.current = window.setTimeout(() => setPlayingId(null), p.progression.length * 800 + 1200);
                    }}
                  >
                    {playingId === p.id ? "…" : t("ui.listen")}
                  </Button>
                  {!isPending && userId && (
                    published.has(p.id) ? (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          loadGallery()
                            .then((m) => m.unpublishPiece({ data: p.id }))
                            .then(() =>
                              setPublished((s) => {
                                const n = new Set(s);
                                n.delete(p.id);
                                return n;
                              }),
                            )
                            .catch(() => {})
                        }
                      >
                        {t("gal.unpublish")}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() =>
                          loadGallery()
                            .then((m) =>
                              m.publishPiece({
                                data: {
                                  id: p.id,
                                  title: p.title,
                                  keyRoot: p.keyRoot,
                                  mode: p.mode,
                                  progression: p.progression,
                                  melody: p.melody,
                                  genre: p.genre ?? null,
                                },
                              }),
                            )
                            .then(() => setPublished((s) => new Set(s).add(p.id)))
                            .catch(() => {})
                        }
                      >
                        {t("gal.publish")}
                      </Button>
                    )
                  )}
                  <Button
                    variant="ghost"
                    onClick={() =>
                      // Retirer dépublie aussi : sinon la copie cloud survit
                      // en galerie alors que le morceau n'existe plus.
                      loadGallery()
                        .then((m) => m.unpublishPiece({ data: p.id }).catch(() => {}))
                        .then(() => deletePiece(p.id))
                    }
                  >
                    {lang === "en" ? "Remove" : "Retirer"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
