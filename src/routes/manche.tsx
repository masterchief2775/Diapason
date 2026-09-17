import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Chip } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { SCALES } from "@/lib/music";
import { resumeAudio } from "@/lib/audio";
import { useLang, useNN, useT } from "@/lib/i18n";

export const Route = createFileRoute("/manche")({ component: ManchePage });

function ManchePage() {
  const t = useT();
  const lang = useLang();
  const nn = useNN();
  const [root, setRoot] = useState(4);
  const [scaleId, setScaleId] = useState<(typeof SCALES)[number]["id"]>("majeure");
  const scale = SCALES.find((s) => s.id === scaleId)!;

  return (
    <Page wide>
      <Title kicker={t("fb.kicker")} lead={t("fb.lead")}>
        {t("fb.title")}
      </Title>
      <div className="mb-5 flex flex-wrap gap-8">
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("fb.tonic")}</p>
          <div className="flex max-w-sm flex-wrap gap-1.5">
            {nn.map((n, i) => (
              <Chip key={n} active={i === root} onClick={() => setRoot(i)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] text-subtle">{t("fb.scale")}</p>
          <div className="flex max-w-md flex-wrap gap-1.5">
            {SCALES.map((s) => (
              <Chip key={s.id} tone="sage" active={s.id === scaleId} onClick={() => setScaleId(s.id)}>
                {lang === "en" ? s.labelEn : s.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <Fretboard
        highlight={{ rootIndex: root, steps: scale.steps }}
        hear
        onCellClick={async () => {
          await resumeAudio();
        }}
      />
    </Page>
  );
}
