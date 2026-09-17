import { Link, Navigate, getRouteApi, useRouterState } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUp, Award, BookOpen, ChevronDown, ClipboardList, Compass, Dices, Download, Drum, Ear, Flame, Globe, Guitar, Hammer, Home, Music2, NotebookPen, Piano, ScrollText, Settings, Sparkles, Star, Target, Trophy, Wand2, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { applyTheme } from "@/lib/theme";
import { playFanfare } from "@/lib/audio";
import { burst, celebrate } from "@/lib/confetti";
import { pushToast, useFeed, type ToastKind } from "@/lib/feed";
import { badgeText, earnedBadges, levelForXp, levelName, newBadges, xpProgress, type ProgressSnap } from "@/lib/gamification";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProgress } from "@/lib/progress";

type NavLeaf = { to: string; key: string; icon: typeof Home; desc: string };

const NAV_GROUPS: { key: string; icon: typeof Home; items: NavLeaf[] }[] = [
  {
    key: "nav.learn",
    icon: BookOpen,
    items: [
      { to: "/parcours", key: "nav.path", icon: Target, desc: "nav.pathD" },
      { to: "/manche", key: "nav.fretboard", icon: Guitar, desc: "nav.fretboardD" },
      { to: "/basse", key: "nav.basse", icon: Guitar, desc: "nav.basseD" },
      { to: "/oreille", key: "nav.ear", icon: Ear, desc: "nav.earD" },
      { to: "/examens", key: "nav.exams", icon: ClipboardList, desc: "nav.examsD" },
      { to: "/memos", key: "nav.memos", icon: ScrollText, desc: "nav.memosD" },
    ],
  },
  {
    key: "nav.create",
    icon: Hammer,
    items: [
      { to: "/studio", key: "nav.studio", icon: Wand2, desc: "nav.studioD" },
      { to: "/carnet", key: "nav.journal", icon: NotebookPen, desc: "nav.journalD" },
      { to: "/galerie", key: "nav.gallery", icon: Globe, desc: "nav.galleryD" },
    ],
  },
  {
    key: "nav.play",
    icon: Dices,
    items: [
      { to: "/jeux", key: "nav.games", icon: Music2, desc: "nav.gamesD" },
      { to: "/batterie", key: "nav.batterie", icon: Drum, desc: "nav.batterieD" },
      { to: "/defi", key: "nav.defi", icon: Flame, desc: "nav.defiD" },
    ],
  },
];

const MOBILE_NAV = [
  { to: "/", key: "nav.home", icon: Home },
  { to: "/parcours", key: "nav.path", icon: Target },
  { to: "/studio", key: "nav.studio", icon: Wand2 },
  { to: "/defi", key: "nav.defi", icon: Flame },
  { to: "/progression", key: "nav.progress", icon: Trophy },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const instrument = useProgress((s) => s.instrument);
  const setInstrument = useProgress((s) => s.setInstrument);
  const theme = useProgress((s) => s.theme);
  // Lecture synchrone dès le premier rendu : évite une redirection abusive
  // quand on démarre hors-ligne (le gate déciderait avec online=true).
  // Note SSR : Node expose un `navigator` global dont onLine vaut undefined —
  // seul un booléen false compte comme hors-ligne, sinon le serveur rendrait
  // le badge offline et casserait l'hydratation.
  const [online, setOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine !== false,
  );
  // Seule la connexion reste publique : tout le reste exige un compte,
  // pour que la progression soit toujours rattachée à un utilisateur.
  const isPublic = pathname === "/login";

  useEffect(() => {
    const go = (v: boolean) => () => setOnline(v);
    const on = go(true);
    const off = go(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Guette les récompenses : nouveaux badges + passages de niveau.
  // (sélecteurs primitifs uniquement : un objet recréé à chaque rendu
  //  boucle useSyncExternalStore pendant l'hydratation)
  const xp = useProgress((s) => s.xp);
  const completed = useProgress((s) => s.completed);
  const scores = useProgress((s) => s.scores);
  const streak = useProgress((s) => s.streak);
  const piecesLen = useProgress((s) => s.pieces.length);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const prevRef = useRef<{ snap: ProgressSnap; level: number } | null>(null);

  useEffect(() => {
    // Avant la fin de l'hydratation persistée, le store expose l'état initial
    // vide (xp=0) : le photographier ferait passer l'hydratation pour un gain
    // (fanfare + modale de niveau à chaque rechargement). On ne touche pas à
    // prevRef tant que ce n'est pas hydraté ; la réhydratation re-déclenche
    // l'effet, qui pose alors une base saine via `if (!prev) return`.
    if (!useProgress.persist.hasHydrated()) return;
    const next: ProgressSnap = { xp, completed, scores, streak, pieces: piecesLen };
    const prev = prevRef.current;
    prevRef.current = { snap: next, level: levelForXp(next.xp) };
    if (!prev) return; // premier rendu : pas de fanfare pour l'existant
    for (const b of newBadges(prev.snap, next)) {
      const txt = badgeText(useProgress.getState().lang, b);
      pushToast("badge", txt.title, { sub: txt.desc });
      burst({ count: 60 });
    }
    if (levelForXp(next.xp) > prev.level) {
      setLevelUp(levelForXp(next.xp));
      celebrate();
      playFanfare();
    }
  }, [xp, completed, scores, streak, piecesLen]);

  return (
    <div className={"min-h-dvh bg-bg" + (isPublic ? "" : " pb-24 md:pb-0")}>
      {!isPublic && <XpBar />}
      {!isPublic && (
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 md:gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 text-fg no-underline">
            <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-fg shadow-sm">
              <Music2 size={16} />
            </span>
            <span className="font-display text-lg tracking-tight">Diapason</span>
          </Link>
          {!online && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-raised px-2.5 py-1 font-mono text-[11px] text-gold">
              <WifiOff size={12} /> {t("nav.offline")}
            </span>
          )}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {NAV_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              const active = group.items.some((it) => pathname === it.to || pathname.startsWith(it.to + "/") || (it.to !== "/" && pathname === it.to));
              const isOpen = group.items.some((it) => pathname === it.to);
              return (
                <DropdownMenu.Root key={group.key}>
                  <DropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm whitespace-nowrap transition-colors",
                        active ? "bg-raised text-gold shadow-sm" : "text-muted hover:bg-raised/60 hover:text-fg",
                      )}
                    >
                      <GroupIcon size={15} /> {t(group.key)}
                      <ChevronDown size={13} className="opacity-60" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="start"
                      sideOffset={8}
                      className="pop-in z-50 min-w-64 rounded-xl border border-line bg-surface p-1.5 shadow-xl"
                    >
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const itemActive = pathname === item.to;
                        return (
                          <DropdownMenu.Item key={item.to} asChild>
                            <Link
                              to={item.to}
                              className={cn(
                                "flex items-start gap-3 rounded-lg px-3 py-2.5 text-fg no-underline outline-none transition-colors",
                                itemActive ? "bg-raised" : "hover:bg-raised/70 focus:bg-raised/70",
                              )}
                            >
                              <span className={cn(
                                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border",
                                itemActive ? "border-gold bg-raised text-gold" : "border-line bg-bg text-muted",
                              )}>
                                <Icon size={15} />
                              </span>
                              <span className="min-w-0">
                                <span className={cn("block text-sm font-medium", itemActive && "text-gold")}>{t(item.key)}</span>
                                <span className="block truncate text-xs text-subtle">{t(item.desc)}</span>
                              </span>
                            </Link>
                          </DropdownMenu.Item>
                        );
                      })}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              );
            })}
            <HeaderDirectLink to="/progression" iconKey="nav.progress" Icon={Trophy} pathname={pathname} t={t} />
          </nav>
          <div
            className="ml-auto hidden items-center gap-1 rounded-sm border border-line bg-surface p-1 md:flex"
            role="group"
            aria-label="Instrument"
            title={`${t("set.sound")} : ${t("sound.guitar")} / ${t("sound.piano")}`}
          >
            {(
              [
                { id: "guitare", key: "sound.guitar", Icon: Guitar },
                { id: "piano", key: "sound.piano", Icon: Piano },
              ] as const
            ).map(({ id, key, Icon }) => (
              <button
                key={id}
                type="button"
                title={t(key)}
                aria-label={t(key)}
                aria-pressed={instrument === id}
                onClick={() => setInstrument(id)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-sm",
                  instrument === id ? "bg-raised text-gold" : "text-muted hover:text-fg",
                )}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button
            type="button"
            title={instrument === "guitare" ? t("sound.guitar") : t("sound.piano")}
            aria-label={instrument === "guitare" ? t("sound.guitar") : t("sound.piano")}
            onClick={() => setInstrument(instrument === "guitare" ? "piano" : "guitare")}
            className="ml-auto flex size-9 items-center justify-center rounded-sm border border-line bg-surface text-gold md:hidden"
          >
            {instrument === "guitare" ? <Guitar size={16} /> : <Piano size={16} />}
          </button>
          <div className="ml-auto hidden items-center gap-1.5 md:flex">
            <Link
              to="/parametres"
              title={t("nav.settings")}
              aria-label={t("nav.settings")}
              className={cn(
                "grid size-9 place-items-center rounded-full transition-colors",
                pathname === "/parametres" ? "bg-raised text-gold" : "text-muted hover:bg-raised/60 hover:text-fg",
              )}
            >
              <Settings size={16} />
            </Link>
            <AuthSlot />
          </div>
        </div>
      </header>
      )}
      <main>{isPublic ? children : <RequireAuth online={online}>{children}</RequireAuth>}</main>
      {!isPublic && <Footer t={t} />}
      {!isPublic && <Toasts />}
      {levelUp !== null && !isPublic && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
      {!isPublic && (
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex justify-around px-1 py-2">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[10px] no-underline transition-colors",
                  active ? "bg-raised text-gold" : "text-muted",
                )}
              >
                <Icon size={16} />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}

/** Lien direct de l'en-tête (sans menu). */
function HeaderDirectLink({
  to, iconKey, Icon, pathname, t,
}: {
  to: string; iconKey: string; Icon: typeof Home; pathname: string; t: (k: string) => string;
}) {
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm whitespace-nowrap no-underline transition-colors",
        active ? "bg-raised text-gold shadow-sm" : "text-muted hover:bg-raised/60 hover:text-fg",
      )}
    >
      <Icon size={15} /> {t(iconKey)}
    </Link>
  );
}

/** Fine barre de progression du niveau, collée en haut sur toutes les pages. */
function XpBar() {
  const xp = useProgress((s) => s.xp);
  const { level, pct, next } = xpProgress(xp);
  const t = useT();
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-1 bg-line/60"
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      title={`${t("feed.level")} ${level} · ${xp}/${next} XP`}
    >
      <div className="fill-gold h-full" style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

const TOAST_ICON: Record<ToastKind, typeof Star> = {
  xp: Star,
  badge: Award,
  record: Trophy,
  level: Sparkles,
};

function Toasts() {
  const toasts = useFeed((s) => s.toasts);
  const dismiss = useFeed((s) => s.dismiss);
  const t = useT();
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) => window.setTimeout(() => dismiss(toast.id), 4200));
    return () => timers.forEach((tm) => window.clearTimeout(tm));
  }, [toasts, dismiss]);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed right-4 bottom-20 z-[90] flex w-72 flex-col gap-2 md:bottom-6" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = TOAST_ICON[toast.kind] ?? Star;
        const title = toast.key.startsWith("feed.") ? t(toast.key).replace("{n}", String(toast.n ?? "")) : toast.key;
        return (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            className="pop-in pointer-events-auto flex items-center gap-3 rounded-xl border border-gold/40 bg-surface p-3 text-left shadow-xl"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-gold">
              <Icon size={17} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{title}</span>
              {toast.sub && <span className="block font-mono text-xs text-gold">{toast.sub}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Modale de passage de niveau : confettis + fanfare déjà joués. */
function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  const t = useT();
  const lang = useProgress((s) => s.lang);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[95] grid place-items-center bg-bg/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("feed.levelUp").replace("{n}", String(level))}
    >
      <div className="pop-in w-full max-w-sm rounded-2xl border border-gold/50 bg-surface p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="m-0 font-mono text-xs tracking-widest text-gold uppercase">{t("feed.levelUp").replace("{n}", String(level))}</p>
        <p className="m-0 mt-2 font-display text-6xl text-gold">{level}</p>
        <p className="m-0 mt-1 font-display text-xl text-fg">{levelName(lang, level)}</p>
        <div className="track mx-auto mt-4 h-2 max-w-48">
          <div className="fill-gold h-full" style={{ width: "100%" }} />
        </div>
        <p className="mt-3 mb-6 text-sm text-muted">{t("feed.levelSub")}</p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg shadow-sm transition-transform active:scale-[0.98]"
        >
          {t("ui.continue")}
        </button>
      </div>
    </div>
  );
}

/** Slot compte dans l'en-tête : squelette pendant le chargement, avatar si connecté, CTA sinon. */
const rootApi = getRouteApi("__root__");

/**
 * Barrière de connexion globale : tant que la session n'est pas résolue,
 * squelette (pas de flash) ; déconnecté + en ligne → /login avec retour ;
 * déconnecté + hors-ligne → accès local (le mode hors-ligne reste utilisable).
 */
function RequireAuth({ online, children }: { online: boolean; children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-4 py-8" aria-hidden>
        <div className="mb-3 h-4 w-32 rounded-sm bg-line" />
        <div className="mb-8 h-9 w-3/4 rounded-sm bg-line" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-24 rounded-xl bg-line" />
          <div className="h-24 rounded-xl bg-line" />
          <div className="h-24 rounded-xl bg-line" />
          <div className="h-24 rounded-xl bg-line" />
        </div>
      </div>
    );
  }
  if (!user && online) {
    return <Navigate to="/login" search={{ redirect: pathname }} />;
  }
  return <>{children}</>;
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  const { sessionUser } = rootApi.useRouteContext();
  const xp = useProgress((s) => s.xp);
  const t = useT();
  // Première peinture SSR + client : la session cookie déjà connue, sans flash.
  const effective = user ?? (sessionUser ? { id: sessionUser.id, displayName: null, primaryEmail: sessionUser.email, profileImageUrl: null, isDevFallback: false } : null);
  if (isPending && !sessionUser) {
    return <span className="size-8 animate-pulse rounded-full bg-line" aria-hidden />;
  }
  if (effective) {
    const label = effective.displayName ?? effective.primaryEmail ?? "…";
    const lv = levelForXp(xp);
    return (
      <Link
        to="/profil"
        className="flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pr-2.5 pl-1 text-fg no-underline transition-colors hover:border-gold"
        title={label}
      >
        {effective.profileImageUrl ? (
          <img src={effective.profileImageUrl} alt="" className="size-7 rounded-full object-cover" />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-raised font-display text-xs text-gold">
            {label.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="font-mono text-[11px] text-gold">{t("feed.level")} {lv}</span>
      </Link>
    );
  }
  return (
    <Link
      to="/login"
      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs text-gold no-underline transition-colors hover:border-gold"
    >
      {t("login.signin")}
    </Link>
  );
}

/** Pied de page : navigation regroupée + install + retour en haut. */
function Footer({ t }: { t: (k: string) => string }) {
  const year = new Date().getFullYear();
  const cols: { title: string; links: { to: string; key: string }[] }[] = [
    {
      title: t("nav.learn"),
      links: [
        ...NAV_GROUPS[0].items.map((i) => ({ to: i.to, key: i.key })),
        { to: "/diagnostic", key: "home.card.diagK" },
      ],
    },
    {
      title: t("nav.create"),
      links: NAV_GROUPS[1].items.map((i) => ({ to: i.to, key: i.key })),
    },
    {
      title: t("nav.play"),
      links: [
        ...NAV_GROUPS[2].items.map((i) => ({ to: i.to, key: i.key })),
        { to: "/progression", key: "nav.progress" },
        { to: "/profil", key: "nav.profil" },
      ],
    },
  ];
  return (
    <footer className="mt-4 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-fg no-underline">
            <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-fg shadow-sm">
              <Music2 size={16} />
            </span>
            <span className="font-display text-lg tracking-tight">Diapason</span>
          </Link>
          <p className="mt-3 mb-4 max-w-xs text-sm leading-relaxed text-muted">{t("foot.tagline")}</p>
          <a
            href="?install=1"
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg px-3 py-2 text-xs text-gold no-underline transition-colors hover:border-gold"
          >
            <Download size={13} /> {t("foot.install")}
          </a>
        </div>
        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="m-0 mb-3 font-mono text-xs tracking-widest text-subtle uppercase">{col.title}</p>
            <ul className="m-0 grid list-none gap-1 p-0">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted no-underline transition-colors hover:text-gold">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <p className="m-0 font-mono text-xs text-subtle">© {year} Diapason</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-gold hover:text-gold"
          >
            <ArrowUp size={13} /> {t("foot.top")}
          </button>
        </div>
      </div>
    </footer>
  );
}
