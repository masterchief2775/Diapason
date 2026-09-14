import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { resumeAudio, playTone, freqForOffset } from "@/lib/audio";
import { NOTES, degreeChord } from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { GENRES } from "@/lib/music";

export const Route = createFileRoute("/carnet")({ component: JournalPage });

function JournalPage() {
  const pieces = useProgress((s) => s.pieces);
  const deletePiece = useProgress((s) => s.deletePiece);

  return (
    <Page>
      <Title kicker="Carnet" lead="Tes grilles enregistrées depuis le studio. Elles restent sur cet appareil.">
        Compositions
      </Title>
      {pieces.length === 0 ? (
        <p className="text-sm text-muted">Rien pour l'instant. Ouvre le studio, pose quatre accords, enregistre.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pieces.map((p) => (
            <div key={p.id} className="rounded-md border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 font-display text-lg">{p.title}</p>
                  <p className="mt-1 mb-0 font-mono text-xs text-subtle">
                    {NOTES[p.keyRoot]} {p.mode}
                    {p.genre ? ` · ${GENRES.find((g) => g.id === p.genre)?.label ?? p.genre}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const ctx = await resumeAudio();
                      const now = ctx.currentTime + 0.05;
                      const steps = p.mode === "majeure" ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
                      p.progression.forEach((d, i) => {
                        const ch = degreeChord(p.keyRoot, p.mode, d);
                        ch.quality.formula.forEach((iv) => {
                          playTone(ctx, freqForOffset(p.keyRoot, ch.rootOffset + iv), now + i * 0.8, 0.75, 0.1);
                        });
                        const m = p.melody[i];
                        if (m != null) {
                          playTone(ctx, freqForOffset(p.keyRoot, steps[m] + 12), now + i * 0.8, 0.7, 0.16);
                        }
                      });
                    }}
                  >
                    Écouter
                  </Button>
                  <Button variant="ghost" onClick={() => deletePiece(p.id)}>
                    Retirer
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
