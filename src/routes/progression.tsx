import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BadgeMedal } from "@/components/badges";
import { Page, Title } from "@/features/page";
import { LESSONS, lessonText } from "@/lib/curriculum";
import { BADGES, badgeText, earnedBadges, last14Days, levelName, titleText, XP_SOURCES, xpProgress } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/progression")({ component: ProgressionPage });

function ProgressionPage() {
  const lang = useLang();
  const t = useT();
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const pieces = useProgress((s) => s.pieces);
  const challenges = useProgress((s) => s.challenges);
  const activity = useProgress((s) => s.activity);
  const level = useProgress((s) => s.level);
  const days = last14Days(activity);

  const earned = earnedBadges({ xp, streak, completed, pieces: pieces.length, scores });
  const earnedIds = new Set(earned.map((b) => b.id));
  const title = titleText(lang, { completed: completed.length, xp });
  const prog = xpProgress(xp);
  const lvlName = levelName(lang, prog.level);
  const avg = (() => {
    const vals = Object.values(scores);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  })();
  const en = lang === "en";

  return (
    <Page>
      <Title
        kicker={level ? `${en ? "Diagnostic" : "Diagnostic"} : ${level}` : en ? "Tracking" : "Suivi"}
        lead={
          en
            ? `Current title: ${title}. Quiz average: ${avg}%. Challenges taken: ${Object.keys(challenges).length}.`
            : `Titre actuel : ${title}. Moyenne quiz : ${avg} %. Défis relevés : ${Object.keys(challenges).length}.`
        }
      >
        {en ? "Your progress" : "Ta progression"}
      </Title>

      <div className="mb-8 flex flex-wrap gap-2">
        <a href="?install=1" className="rounded-sm border border-line bg-surface px-4 py-2.5 text-sm text-gold no-underline">
          {en ? "Install the app (offline)" : "Installer l'app (hors-ligne)"}
        </a>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">XP</p>
          <p className="m-0 font-display text-xl">{xp}</p>
        </div>
        <div className="rounded-xl border border-gold/40 bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-gold">{t("feed.level")} {prog.level} · {lvlName}</p>
          <div className="track mt-2 h-1.5">
            <div className="fill-gold h-full" style={{ width: `${prog.pct * 100}%` }} />
          </div>
          <p className="m-0 mt-1 font-mono text-[11px] text-subtle">{xp}/{prog.next} XP · {t("xpSrc.next")} : {levelName(lang, prog.level + 1)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">{en ? "Streak" : "Série"}</p>
          <p className="m-0 font-display text-xl">{streak} {en ? "d" : "j"}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">{en ? "Lessons" : "Leçons"}</p>
          <p className="m-0 font-display text-xl">{completed.length}/{LESSONS.length}</p>
        </div>
      </div>

      <h2 className="mb-3 font-display text-xl">{en ? "Activity · 14 days" : "Activité · 14 jours"}</h2>
      <div className="panel-sheen mb-10 rounded-xl border border-line bg-surface p-4 shadow-sm">
        {days.every((d) => d.xp === 0) ? (
          <p className="m-0 text-sm text-muted">
            {en ? "Play a lesson or a game: every XP will show up here." : "Joue une leçon ou un jeu : chaque XP apparaîtra ici."}
          </p>
        ) : (
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={days} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7c7264" }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "#7c7264" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1c1712", border: "1px solid #2e2620", fontSize: 12 }}
                  labelStyle={{ color: "#a89a87" }}
                />
                <Area type="monotone" dataKey="xp" name="XP" stroke="#d4c4a0" fill="#d4c4a0" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <h2 className="mb-3 font-display text-xl">{en ? "Badges" : "Badges"} ({earned.length}/{BADGES.length})</h2>
      <div className="mb-10 grid gap-2 sm:grid-cols-2">
        {BADGES.map((b) => {
          const has = earnedIds.has(b.id);
          const txt = badgeText(lang, b);
          return (
            <div key={b.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm transition-transform" style={{ opacity: has ? 1 : 0.45 }}>
              <BadgeMedal icon={b.icon} accent={b.accent} locked={!has} />
              <div className="min-w-0">
                <p className="m-0 text-sm font-medium">{txt.title}</p>
                <p className="m-0 text-xs text-subtle">{txt.desc}</p>
              </div>
              {has && (
                <span className="ml-auto grid size-6 shrink-0 place-items-center rounded-full border border-gold bg-raised font-mono text-[11px] text-gold">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 font-display text-xl">{t("xpSrc.title")}</h2>
      <div className="mb-10 grid gap-1.5 sm:grid-cols-2">
        {XP_SOURCES.map((s) => (
          <div key={s.key} className="flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm">{t(s.key)}</span>
            <span className="font-mono text-xs text-gold">{s.amount}</span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-xl">{en ? "Mastery per lesson" : "Maîtrise par leçon"}</h2>
      <div className="flex flex-col gap-1.5">
        {LESSONS.map((l) => {
          const sc = scores[l.id];
          const done = completed.includes(l.id);
          return (
            <div key={l.id} className="flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm">{lessonText(lang, l).title}</span>
              <span className="font-mono text-xs text-subtle">{done ? (sc != null ? `${sc} %` : en ? "passed" : "validé") : "—"}</span>
              <span className="flex gap-0.5" aria-label={done ? (en ? "mastered" : "maîtrisé") : (en ? "todo" : "à faire")}>
                {[0, 1, 2].map((s) => (
                  <span
                    key={s}
                    className="inline-block size-2 rounded-full"
                    style={{ background: sc != null && sc >= (s + 1) * 33 ? "#d4c4a0" : "#2e2620" }}
                  />
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
