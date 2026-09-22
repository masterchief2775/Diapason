import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Music2 } from "lucide-react";
import { Button } from "@/components/ui";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => {
    const r = typeof s.redirect === "string" ? s.redirect : undefined;
    if (!r || !r.startsWith("/") || r.startsWith("//") || r === "/login" || r.startsWith("/login?") || r.startsWith("/login#")) {
      return {};
    }
    return { redirect: r };
  },
  component: Login,
});

function safeRedirect(to: string): string {
  // Jamais vers /login lui-même (boucle pour un connecté redirigé ici).
  if (!to.startsWith("/") || to.startsWith("//") || to === "/login" || to.startsWith("/login?") || to.startsWith("/login#")) {
    return "/profil";
  }
  return to;
}

function Login() {
  const t = useT();
  const lang = useLang();
  const nav = useNavigate();
  const { redirect } = Route.useSearch();
  const dest = safeRedirect(redirect ?? "/profil");
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  if (!isPending && user && !user.isDevFallback) {
    return <Navigate to={dest} />;
  }

  const submitEmail = async () => {
    setError(null);
    setWorking(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          name: name.trim() || email.split("@")[0],
          email: email.trim(),
          password,
          callbackURL: dest,
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: dest,
        });
        if (error) throw new Error(error.message);
      }
      // Laisse le store de session lire le cookie frais AVANT de naviguer,
      // sinon le gate voit encore `null` et rebondit vers /login. Borné :
      // si le réseau cale, on navigue quand même (le gate tranche ensuite).
      await Promise.race([
        authClient.getSession().catch(() => {}),
        new Promise((r) => window.setTimeout(r, 2500)),
      ]);
      nav({ to: dest });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("login.error"));
    } finally {
      setWorking(false);
    }
  };

  const valid = /.+@.+\..+/.test(email.trim()) && password.length >= 8 && (mode === "in" || name.trim().length > 0);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="string-motif pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="gold-halo pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-fg shadow-md">
            <Music2 size={26} />
          </span>
          <p className="m-0 font-display text-3xl tracking-tight">Diapason</p>
          <p className="mt-1 mb-0 text-sm text-muted">{t("login.tagline")}</p>
        </div>
        {redirect && (
          <p className="pop-in mb-4 rounded-xl border border-gold/50 bg-raised px-4 py-3 text-center text-sm text-gold">
            {t("login.required")}
          </p>
        )}
      <div className="grid gap-3">
        <div className="panel-sheen rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-4 flex gap-2">
            {(
              [
                { id: "up", label: t("login.signup") },
                { id: "in", label: t("login.signin") },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setError(null);
                }}
                className={cn(
                  "rounded-sm border px-4 py-2 text-sm",
                  mode === m.id ? "border-gold bg-raised text-gold" : "border-line bg-bg text-muted",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mb-3 font-mono text-[11px] text-subtle">{t("login.email")}</p>
          {mode === "up" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("login.name")}
              autoComplete="username"
              className="mb-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-sm text-fg"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.emailPh")}
            type="email"
            autoComplete="email"
            className="mb-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-sm text-fg"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.passPh")}
            type="password"
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && valid && !working) void submitEmail();
            }}
            className="mb-3 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-sm text-fg"
          />
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button onClick={() => void submitEmail()} disabled={!valid || working} className="w-full">
            {working ? t("login.working") : mode === "up" ? t("login.signup") : t("login.signin")}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "up" ? "in" : "up")}
            className="mt-3 w-full text-center text-xs text-subtle hover:text-fg"
          >
            {mode === "up" ? t("login.haveAccount") : t("login.noAccount")}
          </button>
        </div>

        {authEnabled && (
          <div className="panel-sheen rounded-xl border border-line bg-surface p-5 shadow-sm">
            <p className="mb-3 font-mono text-[11px] text-subtle">{t("login.social")}</p>
            <div className="flex flex-col gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  variant="outline"
                  className="w-full"
                  onClick={() => void signIn(p.providerId, { callbackURL: dest }).catch(() => setError(t("login.error")))}
                >
                  {lang === "en" ? "Continue with" : "Continuer avec"} {p.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <ul className="m-0 mt-8 grid list-none gap-2 p-0">
          {[t("login.b1"), t("login.b2"), t("login.b3")].map((b) => (
            <li key={b} className="flex items-center justify-center gap-2 text-center text-xs text-subtle">
              <Check size={13} className="shrink-0 text-sage" /> {b}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}
