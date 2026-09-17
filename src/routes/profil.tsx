import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { BadgeMedal } from "@/components/badges";
import { Page, Title } from "@/features/page";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { LESSONS } from "@/lib/curriculum";
import { BADGES, earnedBadges, titleText } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";
import type { SyncOutcome } from "@/lib/sync";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

async function loadSync() {
  return import("@/lib/sync");
}

export const Route = createFileRoute("/profil")({ component: ProfilPage });

function timeAgo(lang: string, ts: number | null): string {
  if (!ts) return lang === "en" ? "never" : "jamais";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return lang === "en" ? "just now" : "à l'instant";
  if (s < 3600) return lang === "en" ? `${Math.floor(s / 60)} min ago` : `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return lang === "en" ? `${Math.floor(s / 3600)} h ago` : `il y a ${Math.floor(s / 3600)} h`;
  return lang === "en" ? `${Math.floor(s / 86400)} d ago` : `il y a ${Math.floor(s / 86400)} j`;
}

function ProfilPage() {
  const t = useT();
  const lang = useLang();
  const en = lang === "en";
  const nav = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const pieces = useProgress((s) => s.pieces);
  const challenges = useProgress((s) => s.challenges);
  const lastSyncAt = useProgress((s) => s.lastSyncAt);
  const [syncState, setSyncState] = useState<"idle" | "working" | "ok" | "error">("idle");
  const [outcome, setOutcome] = useState<SyncOutcome | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoDone = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPending || !userId || autoDone.current) return;
    autoDone.current = true;
    let unwatch: (() => void) | undefined;
    setSyncState("working");
    loadSync()
      .then((m) => {
        unwatch = m.watchLocalChanges();
        return m.syncProgress();
      })
      .then((o) => {
        setOutcome(o);
        setSyncState("ok");
      })
      .catch(() => setSyncState("error"));
    return () => unwatch?.();
  }, [isPending, userId]);

  if (!mounted || isPending) {
    return (
      <Page>
        <div className="animate-pulse">
          <div className="mb-3 h-4 w-32 rounded-sm bg-line" />
          <div className="mb-6 h-9 w-64 rounded-sm bg-line" />
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-line" />
            <div className="flex-1">
              <div className="mb-2 h-5 w-40 rounded-sm bg-line" />
              <div className="h-4 w-56 rounded-sm bg-line" />
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-subtle">{t("profil.loading")}</p>
      </Page>
    );
  }

  if (!user) {
    // Inatteignable en ligne (le gate redirige avant) — mais visible hors-ligne,
    // où la session ne peut être vérifiée : on propose la connexion au retour du réseau.
    return (
      <Page>
        <Title kicker={t("profil.title")} lead={t("profil.loginCta")}>
          {en ? "Account" : "Compte"}
        </Title>
        <Button onClick={() => nav({ to: "/login" })}>{t("profil.goLogin")}</Button>
      </Page>
    );
  }

  const earned = earnedBadges({ xp, streak, completed, pieces: pieces.length, scores });
  const title = titleText(lang, { completed: completed.length, xp });
  const label = user.displayName ?? user.primaryEmail ?? (en ? "Account" : "Compte");

  const outcomeText =
    !outcome || outcome.status === "up-to-date"
      ? t("profil.syncOk")
      : outcome.status === "pushed"
        ? en ? "Local progress sent to cloud." : "Progression locale envoyée vers le cloud."
        : outcome.status === "pulled"
          ? en ? "Cloud progress restored here." : "Progression cloud restaurée ici."
          : t("profil.localOnly");

  const doSync = () => {
    setSyncState("working");
    loadSync()
      .then((m) => m.syncProgress())
      .then((o) => {
        setOutcome(o);
        setSyncState("ok");
      })
      .catch(() => setSyncState("error"));
  };

  return (
    <Page>
      <Title kicker={t("profil.title")} lead={t("profil.memberSince")}>
        {label}
      </Title>

      <Card className="mb-4 flex items-center gap-4">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <span className="grid size-16 place-items-center rounded-full bg-raised font-display text-2xl text-gold">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="m-0 font-display text-xl">{user.displayName ?? (en ? "Guitarist" : "Guitariste")}</p>
          {user.primaryEmail && <p className="m-0 truncate text-sm text-subtle">{user.primaryEmail}</p>}
          <p className="m-0 mt-1 font-mono text-xs text-gold">{title}</p>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">{t("home.xp")}</p>
          <p className="m-0 font-display text-lg">{xp}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">{en ? "Lessons" : "Leçons"}</p>
          <p className="m-0 font-display text-lg">{completed.length}/{LESSONS.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">{t("home.streak")}</p>
          <p className="m-0 font-display text-lg">{streak} {en ? "d" : "j"}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">Badges</p>
          <p className="m-0 font-display text-lg">{earned.length}/{BADGES.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">{en ? "Pieces" : "Morceaux"}</p>
          <p className="m-0 font-display text-lg">{pieces.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 font-mono text-[11px] text-subtle">{en ? "Challenges" : "Défis"}</p>
          <p className="m-0 font-display text-lg">{Object.keys(challenges).length}</p>
        </div>
      </div>

      <div className="panel-sheen mb-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          {syncState === "error" ? <CloudOff size={16} className="text-danger" /> : <Cloud size={16} className="text-gold" />}
          <p className="m-0 font-display text-lg">{t("profil.cloud")}</p>
        </div>
        <p className="mt-0 mb-4 text-sm text-subtle">
          {t("profil.synced")} : {timeAgo(lang, lastSyncAt)} · {syncState === "working" ? t("profil.syncing") : syncState === "error" ? t("login.error") : outcomeText}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={doSync} disabled={syncState === "working"}>
            {t("profil.syncNow")}
          </Button>
          {!confirmErase ? (
            <Button variant="ghost" onClick={() => setConfirmErase(true)}>
              {t("profil.deleteCloud")}
            </Button>
          ) : (
            <span className={cn("inline-flex items-center gap-2 text-sm text-danger")}>
              {t("profil.deleteConfirm")}
              <Button
                variant="danger"
                onClick={() =>
                  loadSync()
                    .then((m) => m.eraseCloud())
                    .then(() => setConfirmErase(false))
                    .catch(() => setConfirmErase(false))
                }
              >
                {t("profil.deleteYes")}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmErase(false)}>
                {t("profil.cancel")}
              </Button>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <UserButton />
        <Link to="/progression" className="text-sm text-subtle hover:text-fg">
          {en ? "Detailed progress →" : "Progrès détaillé →"}
        </Link>
      </div>

      {earned.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm">
          <p className="m-0 mb-3 font-mono text-[11px] text-subtle">Badges · {earned.length}/{BADGES.length}</p>
          <div className="flex flex-wrap gap-2">
            {earned.map((b) => (
              <span key={b.id} title={b.title} aria-label={b.title}>
                <BadgeMedal icon={b.icon} accent={b.accent} size={36} />
              </span>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
