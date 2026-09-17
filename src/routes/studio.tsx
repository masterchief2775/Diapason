import { createFileRoute } from "@tanstack/react-router";
import { CompositionInner } from "@/features/lesson-view";
import { Page, Title } from "@/features/page";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/studio")({ component: StudioPage });

function StudioPage() {
  const t = useT();
  return (
    <Page wide>
      <Title kicker={t("nav.studio")} lead={t("st.lead")}>
        {t("st.title")}
      </Title>
      <CompositionInner />
    </Page>
  );
}
