import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { QuizBlock } from "@/features/quiz-block";
import { DIAGNOSTIC, DIAGNOSTIC_EN, LESSON_ORDER, lessonById, lessonText } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/diagnostic")({ component: DiagnosticPage });

function DiagnosticPage() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "recap">("intro");
  const [pct, setPct] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const setLevel = useProgress((s) => s.setLevel);
  const completed = useProgress((s) => s.completed);
  const nav = useNavigate();
  const lang = useLang();
  const qs = lang === "en" ? DIAGNOSTIC_EN : DIAGNOSTIC;

  const levelFor = (a: number[]): { level: string; advice: string; jumpTo: string } => {
    const confident = a.filter((v, i) => v === qs[i].answer).length;
    if (lang === "en") {
      if (confident >= 5) return { level: "Intermediate", advice: "Solid basics. Head to harmony (Phase 2) and modes.", jumpTo: "accords" };
      if (confident >= 3) return { level: "False beginner", advice: "A few gaps in the basics. Review intervals, then attack scales.", jumpTo: "intervalles" };
      return { level: "True beginner", advice: "Starting from zero is perfect: notes, neck, intervals, in order.", jumpTo: "notes" };
    }
    if (confident >= 5) return { level: "Intermédiaire", advice: "Bases solides. Direction l'harmonie (Phase 2) et les modes.", jumpTo: "accords" };
    if (confident >= 3) return { level: "Faux-débutant", advice: "Quelques trous sur les codages. Revois les intervalles puis attaque les gammes.", jumpTo: "intervalles" };
    return { level: "Grand débutant", advice: "On part de zéro, c'est parfait : notes, manche, intervalles, dans l'ordre.", jumpTo: "notes" };
  };

  if (phase === "intro") {
    return (
      <Page>
        <Title
          kicker={lang === "en" ? "Diagnostic" : "Diagnostic"}
          lead={lang === "en" ? "6 questions to calibrate your starting point. No pressure: it adapts the path." : "6 questions pour calibrer ton point de départ. Sans pression : ça adapte le parcours."}
        >
          {lang === "en" ? "Where do you really stand?" : "Où en es-tu vraiment ?"}
        </Title>
        <Button onClick={() => setPhase("quiz")}>{lang === "en" ? "Start the diagnostic" : "Lancer le diagnostic"}</Button>
      </Page>
    );
  }

  if (phase === "quiz") {
    return (
      <Page>
        <Title kicker={lang === "en" ? "Diagnostic" : "Diagnostic"}>{lang === "en" ? "6 questions" : "6 questions"}</Title>
        <QuizBlock
          questions={qs}
          onDone={(p) => {
            setPct(p);
            void answers;
            setPhase("recap");
          }}
          onAnswers={setAnswers}
        />
      </Page>
    );
  }

  const res = levelFor(answers);
  // Le niveau estimé pointe vers une zone (accords/intervalles) qui peut être
  // verrouillée : on redirige vers la première leçon non terminée du parcours,
  // toujours débloquée par construction (préfixe strict).
  const firstTodo = LESSON_ORDER.find((id) => !completed.includes(id)) ?? "notes";
  const goId = completed.includes(res.jumpTo) || res.jumpTo === firstTodo ? res.jumpTo : firstTodo;
  return (
    <Page>
      <Title kicker={lang === "en" ? "Diagnostic · result" : "Diagnostic · résultat"} lead={res.advice}>
        {lang === "en" ? `Estimated level: ${res.level} (${pct}%)` : `Niveau estimé : ${res.level} (${pct} %)`}
      </Title>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setLevel(res.level);
            // Pas de completeLesson ici : le diagnostic oriente, il ne valide
            // pas une leçon jamais faite (ni son XP).
            nav({ to: "/lecon/$id", params: { id: goId } });
          }}
        >
          {lang === "en" ? "Go to" : "Aller à"} « {lessonById(goId) ? lessonText(lang, lessonById(goId)!).title : goId} »
        </Button>
        <Button variant="outline" onClick={() => nav({ to: "/parcours" })}>
          {lang === "en" ? "See the path" : "Voir le parcours"}
        </Button>
      </div>
    </Page>
  );
}
