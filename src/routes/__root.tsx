import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import appCss from "../styles.css?url";

const APP_NAME = "Diapason";

/** Session SSR depuis le cookie (zéro-flash quand déployé / cookie présent). */
const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email } : null;
});

function useServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Le SW met en cache leçons + jeux pour le mode hors-ligne (jamais __grok/).
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
}

export const Route = createRootRoute({
  beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "Théorie musicale guidée pour guitaristes — de zéro à la composition." },
      { name: "theme-color", content: "#14110F" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap",
      },
    ],
  }),
  component: () => {
    useServiceWorker();
    return (
      <html lang="fr" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body className="bg-bg text-fg antialiased">
          <PreviewHostBridge />
          <AuthProvider>
            <Shell>
              <Outlet />
            </Shell>
          </AuthProvider>
          <Scripts />
        </body>
      </html>
    );
  },
});
