import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Guitar, Languages, Music4, Palette, Piano, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Page, Title } from "@/features/page";
import { useProgress } from "@/lib/progress";
import { useT, type Lang, type Naming } from "@/lib/i18n";
import { THEMES, type ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parametres")({ component: SettingsPage });

function Row({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="mb-1 flex items-center gap-2 text-gold">
        {icon}
        <p className="m-0 font-display text-lg text-fg">{title}</p>
      </div>
      <p className="mt-0 mb-4 text-sm text-subtle">{hint}</p>
      {children}
    </div>
  );
}

function SettingsPage() {
  const t = useT();
  const lang = useProgress((s) => s.lang);
  const setLang = useProgress((s) => s.setLang);
  const naming = useProgress((s) => s.naming);
  const setNaming = useProgress((s) => s.setNaming);
  const instrument = useProgress((s) => s.instrument);
  const setInstrument = useProgress((s) => s.setInstrument);
  const theme = useProgress((s) => s.theme);
  const setTheme = useProgress((s) => s.setTheme);
  const resetAll = useProgress((s) => s.resetAll);
  const [confirm, setConfirm] = useState(false);

  const pick = <T extends string>(value: T, current: T, onPick: (v: T) => void, label: React.ReactNode) => (
    <button
      key={String(value)}
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={value === current}
      className={cn(
        "rounded-sm border px-4 py-2.5 text-sm",
        value === current ? "border-gold bg-raised text-gold" : "border-line bg-bg text-muted",
      )}
    >
      {label}
    </button>
  );

  const setL = (l: string) => setLang(l as Lang);
  const setN = (n: string) => setNaming(n as Naming);

  return (
    <Page>
      <Title kicker={t("nav.settings")} lead={t("set.lead")}>
        {t("set.title")}
      </Title>
      <div className="grid gap-3">
        <Row icon={<Languages size={16} />} title={t("set.lang")} hint={t("set.langHint")}>
          <div className="flex gap-2">
            {pick("fr", lang, setL, "Français")}
            {pick("en", lang, setL, "English")}
          </div>
        </Row>

        <Row icon={<Music4 size={16} />} title={t("set.naming")} hint={t("set.namingHint")}>
          <div className="flex flex-wrap gap-2">
            {pick("solf", naming, setN, t("set.solf"))}
            {pick("abc", naming, setN, t("set.abc"))}
          </div>
        </Row>

        <Row icon={<Guitar size={16} />} title={t("set.sound")} hint={t("set.soundHint")}>
          <div className="flex gap-2">
            {pick("guitare", instrument, setInstrument, <span className="inline-flex items-center gap-1.5"><Guitar size={15} /> {t("sound.guitar")}</span>)}
            {pick("piano", instrument, setInstrument, <span className="inline-flex items-center gap-1.5"><Piano size={15} /> {t("sound.piano")}</span>)}
          </div>
        </Row>

        <Row icon={<Palette size={16} />} title={t("set.theme")} hint={t("set.themeHint")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {THEMES.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setTheme(th.id as ThemeId)}
                aria-pressed={theme === th.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-sm border px-3 py-2.5 text-left text-sm",
                  theme === th.id ? "border-gold bg-raised text-gold" : "border-line bg-bg text-muted",
                )}
              >
                <span
                  className="size-6 shrink-0 rounded-full border border-line"
                  style={{ background: `linear-gradient(135deg, ${th.bg} 50%, ${th.swatch} 50%)` }}
                  aria-hidden
                />
                {lang === "en" ? th.en : th.fr}
              </button>
            ))}
          </div>
        </Row>

        <Row icon={<Trash2 size={16} />} title={t("set.data")} hint={t("set.resetHint")}>
          {!confirm ? (
            <Button variant="danger" onClick={() => setConfirm(true)}>
              {t("set.reset")}
            </Button>
          ) : (
            <div>
              <p className="mb-3 text-sm text-danger">{t("set.resetConfirm")}</p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    resetAll();
                    setConfirm(false);
                  }}
                >
                  {t("set.resetYes")}
                </Button>
                <Button variant="outline" onClick={() => setConfirm(false)}>
                  {t("set.resetNo")}
                </Button>
              </div>
            </div>
          )}
        </Row>

        <p className="mt-2 text-center text-xs text-subtle">{t("set.about")}</p>
      </div>
    </Page>
  );
}
