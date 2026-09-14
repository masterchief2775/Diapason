import { createFileRoute } from "@tanstack/react-router";
import { CompositionInner } from "@/features/lesson-view";
import { Page, Title } from "@/features/page";

export const Route = createFileRoute("/studio")({ component: StudioPage });

function StudioPage() {
  return (
    <Page wide>
      <Title kicker="Studio" lead="Grille diatonique, mélodie par degrés, templates de genres. Tout s'écoute.">
        Compose une progression
      </Title>
      <CompositionInner />
    </Page>
  );
}
