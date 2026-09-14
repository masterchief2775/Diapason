import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock } from "@/features/quiz-block";
import { DIAGNOSTIC, lessonById } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/diagnostic")({ component: DiagnosticPage });

function DiagnosticPage() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "recap">("intro");
  const [pct, setPct] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const setLevel = useProgress((s) => s.setLevel);
  const completeLesson = useProgress((s) => s.completeLesson);
  const nav = useNavigate();

  const levelFor = (a: number[]): { level: string; advice: string; jumpTo: string } => {
    const confident = a.filter((v, i) => v === DIAGNOSTIC[i].answer).length;
    if (confident >= 5) return { level: "Intermédiaire", advice: "Bases solides. Direction l'harmonie (Phase 2) et les modes.", jumpTo: "accords" };
    if (confident >= 3) return { level: "Faux-débutant", advice: "Quelques trous sur les codages. Revois les intervalles puis attaque les gammes.", jumpTo: "intervalles" };
    return { level: "Grand débutant", advice: "On part de zéro, c'est parfait : notes, manche, intervalles, dans l'ordre.", jumpTo: "notes" };
  };

  if (phase === "intro") {
    return (
      <Page>
        <Title kicker="Diagnostic" lead="6 questions pour calibrer ton point de départ. Sans pression : ça adapte le parcours.">
          Où en es-tu vraiment ?
        </Title>
        <Button onClick={() => setPhase("quiz")}>Lancer le diagnostic</Button>
      </Page>
    );
  }

  if (phase === "quiz") {
    return (
      <Page>
        <Title kicker="Diagnostic">6 questions</Title>
        <QuizBlock
          questions={DIAGNOSTIC}
          onDone={(p) => {
            setPct(p);
            // estime les réponses via le score seul pour le niveau
            void answers;
            setPhase("recap");
          }}
          onAnswers={setAnswers}
        />
      </Page>
    );
  }

  const res = levelFor(answers);
  return (
    <Page>
      <Title kicker="Diagnostic · résultat" lead={res.advice}>
        Niveau estimé : {res.level} ({pct} %)
      </Title>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setLevel(res.level);
            // petit bonus : si déjà fort, on valide la toute première leçon
            if (res.level === "Intermédiaire") completeLesson("notes", 80);
            nav({ to: "/lecon/$id", params: { id: res.jumpTo } });
          }}
        >
          Aller à « {lessonById(res.jumpTo)?.title ?? res.jumpTo} »
        </Button>
        <Button variant="outline" onClick={() => nav({ to: "/parcours" })}>
          Voir le parcours
        </Button>
      </div>
    </Page>
  );
}
