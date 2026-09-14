import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Music2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { resumeAudio, playIntervalAscending } from "@/lib/audio";
import { INTERVALS, shuffle } from "@/lib/music";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/oreille")({ component: EarPage });

function EarPage() {
  const [question, setQuestion] = useState<(typeof INTERVALS)[number] | null>(null);
  const [choices, setChoices] = useState<(typeof INTERVALS)[number][]>([]);
  const [selected, setSelected] = useState<(typeof INTERVALS)[number] | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const total = 8;
  const addXp = useProgress((s) => s.addXp);
  const nav = useNavigate();

  const play = async (semis: number) => {
    await resumeAudio();
    playIntervalAscending(4, semis);
  };

  const newQ = () => {
    const shuffled = shuffle([...INTERVALS]);
    const correct = shuffled[0];
    const opts = shuffle(shuffled.slice(0, 4));
    setQuestion(correct);
    setChoices(opts);
    setSelected(null);
    setTimeout(() => play(correct.semis), 200);
  };

  useEffect(() => {
    newQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = round >= total;

  return (
    <Page>
      <Title kicker="Entraînement libre" lead="Deux notes successives. Nomme l'intervalle.">
        Oreille · intervalles
      </Title>
      {!finished && question ? (
        <>
          <div className="mb-4 flex justify-between font-mono text-xs text-subtle">
            <span>
              {round + 1} / {total}
            </span>
            <span className="text-sage">Score {score}</span>
          </div>
          <button
            type="button"
            onClick={() => play(question.semis)}
            className="mx-auto mb-7 flex items-center gap-2 rounded-md border border-line bg-surface px-7 py-4 text-gold"
          >
            <Music2 size={18} /> Rejouer
          </button>
          <div className="grid grid-cols-2 gap-2">
            {choices.map((opt) => {
              const show = !!selected;
              const ok = opt.semis === question.semis;
              const mine = selected?.semis === opt.semis;
              return (
                <button
                  key={opt.semis}
                  type="button"
                  onClick={() => {
                    if (selected) return;
                    setSelected(opt);
                    if (opt.semis === question.semis) setScore((s) => s + 1);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-3 text-left text-sm capitalize",
                    !show && "border-line bg-surface text-muted",
                    show && ok && "border-sage bg-sage-dim text-sage",
                    show && mine && !ok && "border-danger bg-danger-dim text-danger",
                    show && !ok && !mine && "border-line bg-surface text-subtle",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {selected && (
            <Button
              className="mt-5"
              onClick={() => {
                if (round + 1 >= total) {
                  addXp(score * 3);
                  setRound(total);
                } else {
                  setRound((r) => r + 1);
                  newQ();
                }
              }}
            >
              {round + 1 >= total ? "Résultat" : "Suivant"}
            </Button>
          )}
        </>
      ) : (
        <div className="pt-6 text-center">
          <h2 className="font-display text-3xl">
            {score} / {total}
          </h2>
          <p className="mb-6 text-sm text-muted">
            {score >= total - 1 ? "Oreille très nette." : "La répétition muscle l'écoute."}
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setScore(0);
                setRound(0);
                newQ();
              }}
            >
              <RotateCcw size={15} /> Refaire
            </Button>
            <Button onClick={() => nav({ to: "/" })}>Accueil</Button>
          </div>
        </div>
      )}
    </Page>
  );
}
