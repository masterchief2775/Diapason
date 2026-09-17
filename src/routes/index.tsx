import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight, ClipboardList, Compass, Drum, Ear, Flame, Guitar, ScrollText, Sparkles, Star,
  Target, Trophy, Wand2, Dices, Map,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { Page } from "@/features/page";
import { LESSONS, LESSON_ORDER, PHASES, lessonById, lessonText } from "@/lib/curriculum";
import { DAILY_GOAL, dailyChallenge, challengeText, reviewQueue } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const t = useT();
  const lang = useLang();
  const completed = useProgress((s) => s.completed);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const percent = useProgress((s) => s.percent());
  const onboarded = useProgress((s) => s.onboarded);
  const setOnboarded = useProgress((s) => s.setOnboarded);
  const isUnlocked = useProgress((s) => s.isUnlocked);
  const nav = useNavigate();
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    if (!onboarded) setShowOnboard(true);
  }, [onboarded]);

  const nextId = LESSON_ORDER.find((id) => !completed.includes(id)) ?? LESSON_ORDER[0];
  const next = lessonById(nextId);
  const level = useProgress((s) => s.level);
  const scores = useProgress((s) => s.scores);
  const defi = dailyChallenge();
  const defiDone = useProgress((s) => s.challenges[defi.seed] ?? 0);
  const [defiLabel] = challengeText(lang, defi.kind);
  const queue = reviewQueue({ order: LESSON_ORDER, completed, scores, isUnlocked });
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayXp = useProgress((s) => s.activity[todayKey] ?? 0);
  const phaseOfNext = next ? PHASES[(next?.phase ?? 1) - 1] : undefined;

  const goLessons = () => {
    setOnboarded();
    setShowOnboard(false);
    nav({ to: "/lecon/$id", params: { id: "notes" } });
  };

  return (
    <Page>
      {/* ---------- Hero ---------- */}
      <section className="panel-sheen relative mb-8 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="string-motif pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="gold-halo pointer-events-none absolute -top-20 -right-20 h-64 w-64" aria-hidden />
        <div className="relative p-6 md:p-10">
          {showOnboard ? (
            <>
              <p className="m-0 flex items-center gap-2 font-mono text-xs tracking-widest text-gold uppercase">
                <Sparkles size={13} /> {t("home.welcome")}
              </p>
              <h1 className="mt-2 mb-2 max-w-xl font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
                {t("home.hero")}
              </h1>
              <p className="mb-6 max-w-lg text-base leading-relaxed text-muted">{t("home.heroSub")}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={goLessons} className="px-6 py-3 text-base">
                  {t("home.startNotes")} <ChevronRight size={17} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="m-0 flex items-center gap-2 font-mono text-xs tracking-widest text-gold uppercase">
                <span className="live-dot inline-block size-1.5 rounded-full bg-gold" aria-hidden />
                {phaseOfNext ? (lang === "en" ? phaseOfNext.titleEn : phaseOfNext.title) : t("home.path")}
              </p>
              <h1 className="mt-2 mb-2 max-w-xl font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
                {t("home.title")}
              </h1>
              <p className="mb-6 max-w-xl text-base leading-relaxed text-muted">
                {next ? `${t("home.next")} : ${lessonText(lang, next).title.toLowerCase()}.` : t("home.doneAll")}
              </p>
              {next && isUnlocked(next.id) && (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/lecon/$id"
                    params={{ id: next.id }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent px-6 py-3 text-base font-medium text-accent-fg no-underline shadow-sm transition-transform active:scale-[0.98]"
                  >
                    {t("home.continue")} <ChevronRight size={17} />
                  </Link>
                  <span className="font-display text-sm text-subtle">{lessonText(lang, next).title}</span>
                </div>
              )}
              <div className="mt-6 max-w-md">
                <div className="mb-1.5 flex justify-between font-mono text-[11px] text-subtle">
                  <span>{t("home.path")}</span>
                  <span className="text-gold">{percent} %</span>
                </div>
                <div className="track h-2">
                  <div className="fill-gold h-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Flame size={17} />} label={t("home.streak")} value={`${streak} ${lang === "en" ? "d" : "j"}`} hot={streak >= 3} />
        <Stat icon={<Star size={17} />} label={t("home.xp")} value={`${xp} XP`} />
        <Stat icon={<Target size={17} />} label={t("home.path")} value={`${percent} %`} />
        <GoalStat today={todayXp} goal={DAILY_GOAL} label={t("feed.daily")} doneLabel={t("ui.done")} />
      </div>

      {/* ---------- Destinations ---------- */}
      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        <Dest
          to="/defi"
          icon={<Dices size={19} />}
          kicker={t("home.card.defiK")}
          title={defiLabel}
          sub={defiDone > 0 ? t("home.card.defiDone") : t("home.card.defiTodo")}
        />
        {!level && (
          <Dest to="/diagnostic" icon={<Compass size={19} />} kicker={t("home.card.diagK")} title={t("home.card.diagT")} />
        )}
        <Dest to="/studio" icon={<Wand2 size={19} />} kicker={t("home.card.studioK")} title={t("home.card.studioT")} />
        <Dest to="/oreille" icon={<Ear size={19} />} kicker={t("home.card.earK")} title={t("home.card.earT")} />
        <Dest to="/jeux" icon={<Guitar size={19} />} kicker={t("home.card.gamesK")} title={t("home.card.gamesT")} />
        <Dest to="/batterie" icon={<Drum size={19} />} kicker={t("home.card.drumK")} title={t("home.card.drumT")} />
        <Dest to="/manche" icon={<Map size={19} />} kicker={t("home.card.exploreK")} title={t("home.card.exploreT")} />
        <Dest to="/basse" icon={<Guitar size={19} />} kicker={t("home.card.basseK")} title={t("home.card.basseT")} />
        <Dest to="/examens" icon={<ClipboardList size={19} />} kicker={t("home.card.examsK")} title={t("home.card.examsT")} />
        <Dest to="/memos" icon={<ScrollText size={19} />} kicker={t("home.card.memoK")} title={t("home.card.memoT")} />
        <Dest to="/progression" icon={<Trophy size={19} />} kicker={t("home.card.progK")} title={t("home.card.progT")} />
      </div>

      {queue.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
            <span className="flex size-7 items-center justify-center rounded-md bg-raised text-gold">
              <Sparkles size={15} />
            </span>
            {t("home.review")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {queue.map((q) => {
              const l = lessonById(q.id);
              if (!l) return null;
              return (
                <Link
                  key={q.id}
                  to="/lecon/$id"
                  params={{ id: q.id }}
                  className="card-lift rounded-xl border border-line bg-surface p-5 text-fg no-underline"
                >
                  <p className="m-0 font-mono text-xs text-gold">{scores[q.id] != null ? `${scores[q.id]} %` : t("home.new")}</p>
                  <p className="m-0 font-display text-lg">{lessonText(lang, l).title}</p>
                  <p className="mt-1 mb-0 text-xs text-subtle">
                    {q.kind === "next" ? t("home.nextStepOf") : `${scores[q.id]} % — ${t("home.aim80")}`}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <h2 className="mb-4 font-display text-xl">{t("home.preview")}</h2>
      {PHASES.map((phase) => {
        const mine = LESSONS.filter((l) => l.phase === phase.id);
        const doneCount = mine.filter((m) => completed.includes(m.id)).length;
        return (
          <Card key={phase.id} className="mb-4">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-mono text-xs text-gold">{t("home.phase")} {phase.id}</span>
              <span className="font-display text-lg">{lang === "en" ? phase.titleEn : phase.title}</span>
              <span className="ml-auto font-mono text-xs text-subtle">{doneCount}/{mine.length}</span>
            </div>
            <div className="track mb-3 h-1">
              <div className="fill-sage h-full" style={{ width: `${mine.length ? (doneCount / mine.length) * 100 : 0}%` }} />
            </div>
            <ul className="m-0 list-none p-0">
              {mine.map((m) => {
                const done = completed.includes(m.id);
                return (
                  <li key={m.id} className="border-t border-line py-2 text-sm first:border-t-0">
                    <Link to="/lecon/$id" params={{ id: m.id }} className="group flex items-center gap-2.5 text-inherit no-underline">
                      <span className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[10px]",
                        done ? "border-sage bg-sage-dim text-sage" : "border-line text-subtle group-hover:border-gold group-hover:text-gold",
                      )}>
                        {done ? "✓" : "·"}
                      </span>
                      <span className="text-muted group-hover:text-fg">{lessonText(lang, m).title}</span>
                      <ChevronRight size={14} className="ml-auto shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
    </Page>
  );
}

function Stat({ icon, label, value, hot }: { icon: ReactNode; label: string; value: string; hot?: boolean }) {
  return (
    <div className="panel-sheen rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-2.5 text-gold">
        <span className={cn("grid size-8 place-items-center rounded-md border border-line bg-raised", hot && "live-dot border-gold/50")}>{icon}</span>
      </div>
      <p className="m-0 font-mono text-[11px] whitespace-nowrap text-subtle">{label}</p>
      <p className="m-0 font-display text-xl">{value}</p>
    </div>
  );
}

/** Objectif quotidien : anneau XP du jour vs but. */
function GoalStat({ today, goal, label, doneLabel }: { today: number; goal: number; label: string; doneLabel: string }) {
  const pct = Math.min(1, today / goal);
  const done = today >= goal;
  const r = 12;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("rounded-xl border bg-surface p-4 shadow-sm", done ? "border-gold" : "panel-sheen border-line")}>
      <div className="mb-2.5">
        <span className="relative inline-grid size-8 place-items-center" role="img" aria-label={`${today}/${goal} XP`}>
          <svg width="32" height="32" className="-rotate-90">
            <circle cx="16" cy="16" r={r} fill="none" stroke="var(--color-line)" strokeWidth="4" />
            <circle
              cx="16" cy="16" r={r} fill="none"
              stroke={done ? "var(--color-sage)" : "var(--color-gold)"}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
              style={{ transition: "stroke-dashoffset 0.6s var(--ease-out)" }}
            />
          </svg>
          <Flame size={12} className={cn("absolute", done ? "text-sage" : "text-gold", today > 0 && !done && "live-dot")} />
        </span>
      </div>
      <p className="m-0 font-mono text-[11px] whitespace-nowrap text-subtle">{label}</p>
      <p className="m-0 font-display text-xl">
        {today}<span className="text-sm text-subtle">/{goal} XP</span>
      </p>
      {done && <p className="m-0 mt-0.5 font-mono text-[11px] text-sage">✓ {doneLabel}</p>}
    </div>
  );
}

function Dest({ to, icon, kicker, title, sub }: { to: string; icon: ReactNode; kicker: string; title: string; sub?: string }) {
  return (
    <Link to={to} className="card-lift group flex min-w-0 items-center gap-4 rounded-xl border border-line bg-surface p-5 text-fg no-underline">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-raised text-gold transition-colors group-hover:border-gold">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="m-0 block font-mono text-xs whitespace-nowrap text-subtle">{kicker}</span>
        <span className="m-0 block font-display text-lg leading-snug text-balance">{title}</span>
        {sub && <span className="m-0 mt-0.5 block truncate text-xs text-subtle">{sub}</span>}
      </span>
      <ChevronRight size={16} className="ml-auto shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
    </Link>
  );
}
