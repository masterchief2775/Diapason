import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Lock, Sparkles } from "lucide-react";
import { Page, Title } from "@/features/page";
import { LESSONS, LESSON_ORDER, PHASES, lessonText } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parcours")({ component: Parcours });

function Parcours() {
  const t = useT();
  const lang = useLang();
  const completed = useProgress((s) => s.completed);
  const isUnlocked = useProgress((s) => s.isUnlocked);
  const scores = useProgress((s) => s.scores);
  const current = LESSON_ORDER.find((id) => !completed.includes(id));

  return (
    <Page>
      <Title kicker={t("path.kicker")} lead={t("path.lead")}>
        {t("path.title")}
      </Title>
      {PHASES.map((phase) => (
        <section key={phase.id} className="mb-8 rounded-xl border border-line bg-surface p-4 shadow-sm md:p-5">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-mono text-xs text-gold">{t("home.phase")} {phase.id}</span>
            <h2 className="m-0 font-display text-xl">{lang === "en" ? phase.titleEn : phase.title}</h2>
            <span className="ml-auto font-mono text-xs text-subtle">{phase.range} · {LESSONS.filter((l) => l.phase === phase.id && completed.includes(l.id)).length}/{LESSONS.filter((l) => l.phase === phase.id).length}</span>
          </div>
          <div className="track mb-3 h-1">
            <div
              className="fill-sage h-full"
              style={{
                width: `${(LESSONS.filter((l) => l.phase === phase.id && completed.includes(l.id)).length / Math.max(1, LESSONS.filter((l) => l.phase === phase.id).length)) * 100}%`,
              }}
            />
          </div>
          <div className="flex flex-col">
            {LESSONS.filter((l) => l.phase === phase.id).map((m) => {
              const txt = lessonText(lang, m);
              const done = completed.includes(m.id);
              const open = isUnlocked(m.id);
              const currentOne = m.id === current;
              // Verrouillé = non cliquable (pas de détour vers le mur) ;
              // Link garde la même apparence via les mêmes classes.
              const cls =
                "group flex items-center gap-3 border-t border-line px-1 py-3 text-fg no-underline first:border-t-0";
              const inner = (
                <>
                  <span className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border",
                    done && "border-sage bg-sage-dim text-sage",
                    !done && currentOne && "border-gold bg-raised text-gold",
                    !done && !currentOne && !open && "border-line text-subtle",
                    !done && !currentOne && open && "border-line text-subtle group-hover:border-gold group-hover:text-gold",
                  )}>
                    {done ? <Check size={13} /> : currentOne ? <Sparkles size={13} /> : !open ? <Lock size={12} /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-sm font-medium">{txt.title}</p>
                    <p className="m-0 truncate text-xs text-subtle">{txt.summary}</p>
                  </div>
                  {scores[m.id] != null && (
                    <span className="shrink-0 font-mono text-xs text-sage">{scores[m.id]}%</span>
                  )}
                  <ChevronRight size={15} className="shrink-0 text-subtle opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-gold group-hover:opacity-100" />
                </>
              );
              return open || done ? (
                <Link key={m.id} to="/lecon/$id" params={{ id: m.id }} className={cls}>
                  {inner}
                </Link>
              ) : (
                <span key={m.id} className={cls} aria-disabled="true" title={lang === "en" ? "Finish the previous lesson first" : "Termine d'abord la leçon précédente"}>
                  {inner}
                </span>
              );
            })}
          </div>
        </section>
      ))}
    </Page>
  );
}
