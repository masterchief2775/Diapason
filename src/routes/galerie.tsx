import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { freqForOffset, playTone, resumeAudio } from "@/lib/audio";
import { GENRES, degreeChord, type ModeKey } from "@/lib/music";
import type { GalleryPiece } from "@/lib/cloud-gallery";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProgress } from "@/lib/progress";
import { useLang, useNN, useT } from "@/lib/i18n";

async function loadGallery() {
  return import("@/lib/cloud-gallery");
}

export const Route = createFileRoute("/galerie")({ component: GaleriePage });

async function playPiece(p: GalleryPiece) {
  const ctx = await resumeAudio();
  const now = ctx.currentTime + 0.05;
  const steps = p.mode === "majeure" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  p.progression.forEach((d, i) => {
    const ch = degreeChord(p.keyRoot, p.mode as ModeKey, d);
    ch.quality.formula.forEach((iv) => {
      playTone(ctx, freqForOffset(p.keyRoot, ch.rootOffset + iv), now + i * 0.8, 0.75, 0.1);
    });
    const m = p.melody[i];
    if (m != null && steps[m] != null) {
      playTone(ctx, freqForOffset(p.keyRoot, steps[m] + 12), now + i * 0.8, 0.7, 0.16);
    }
  });
}

function GaleriePage() {
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const { isPending } = useCurrentUserState();
  const userId = useCurrentUserState().user?.id;
  const savePiece = useProgress((s) => s.savePiece);
  const [pieces, setPieces] = useState<GalleryPiece[]>([]);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  // Garde anti-chevauchement : un seul Écouter à la fois.
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (playTimer.current !== null) window.clearTimeout(playTimer.current);
  }, []);
  const listen = (p: GalleryPiece) => {
    if (playingId !== null) return;
    setPlayingId(p.id);
    void playPiece(p);
    if (playTimer.current !== null) window.clearTimeout(playTimer.current);
    playTimer.current = window.setTimeout(() => setPlayingId(null), p.progression.length * 800 + 1200);
  };

  useEffect(() => {
    let alive = true;
    loadGallery()
      .then((m) => m.listGallery())
      .then((rows) => {
        if (alive) setPieces(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (isPending || !userId) return;
    loadGallery()
      .then((m) => m.myPublishedIds())
      .then((ids) => setMine((prev) => {
        if (prev.size === ids.length && ids.every((id) => prev.has(id))) return prev;
        return new Set(ids);
      }))
      .catch(() => {});
  }, [isPending, userId]);

  const genreLabel = (id: string | null) => {
    if (!id) return null;
    const g = GENRES.find((x) => x.id === id);
    return g ? (lang === "en" ? g.labelEn : g.label) : id;
  };

  return (
    <Page>
      <Title kicker={t("gal.title")} lead={t("gal.lead")}>
        {t("gal.title")}
      </Title>
      {!isPending && !userId && (
        <p className="mb-6 text-sm text-subtle">
          {t("gal.loginHint")}{" "}
          <Link to="/login" className="text-gold">
            {t("profil.goLogin")}
          </Link>
        </p>
      )}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-md bg-line" />
          ))}
        </div>
      ) : pieces.length === 0 ? (
        <EmptyState
          icon={<Globe size={20} />}
          title={lang === "en" ? "Nothing here yet" : "Rien pour l'instant"}
          hint={t("gal.empty")}
          action={
            <Link to="/studio" className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg no-underline shadow-sm">
              {lang === "en" ? "Compose something" : "Composer un morceau"}
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pieces.map((p) => {
            const g = genreLabel(p.genre);
            const isMine = mine.has(p.id);
            const isTaken = taken.has(p.id);
            return (
              <div key={p.id} className="panel-sheen rounded-xl border border-line bg-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 truncate font-display text-lg">{p.title}</p>
                    <p className="mt-1 mb-0 font-mono text-xs text-subtle">
                      {t("gal.by")} {p.author} · {nn[p.keyRoot]} {p.mode === "majeure" ? (lang === "en" ? "major" : "majeure") : lang === "en" ? "minor" : "mineure"}
                      {g ? ` · ${g}` : ""}
                    </p>
                    <p className="m-0 mt-1 font-mono text-xs text-gold">
                      {p.progression.map((d) => degreeChord(p.keyRoot, p.mode as ModeKey, d).numeral).join(" – ")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => listen(p)} disabled={playingId !== null}>
                    {playingId === p.id ? "…" : t("gal.listen")}
                  </Button>
                  {userId && !isMine && (
                    <Button
                      variant="outline"
                      disabled={isTaken}
                      onClick={() => {
                        savePiece({
                          title: `${p.title}`,
                          keyRoot: p.keyRoot,
                          mode: p.mode,
                          progression: [...p.progression],
                          melody: [...p.melody],
                          genre: p.genre ?? undefined,
                        });
                        setTaken((s) => new Set(s).add(p.id));
                      }}
                    >
                      {isTaken ? t("gal.forked") : t("gal.fork")}
                    </Button>
                  )}
                  {userId && isMine && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        loadGallery()
                          .then((m) => m.unpublishPiece({ data: p.id }))
                          .then(() => {
                            setPieces((ps) => ps.filter((x) => x.id !== p.id));
                            setMine((s) => {
                              const n = new Set(s);
                              n.delete(p.id);
                              return n;
                            });
                          })
                          .catch(() => {})
                      }
                    >
                      {t("gal.unpublish")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
