/* Diapason — service worker hors-ligne (leçons, jeux, oreille, manche).
 * Stratégie : precache de l'accueil + navigation network-first avec repli cache.
 * Ne touche jamais à /__grok/* (chrome plateforme) ni aux requêtes non-GET. */

const VERSION = "diapason-v2";
const CORE = ["/", "/parcours", "/manche", "/oreille", "/jeux", "/studio"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isBypass(url) {
  return (
    url.pathname.startsWith("/__grok") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_")
  );
}

/**
 * Mise en cache tolérante : Vite dev sert les modules transformés avec
 * `Cache-Control: no-store`, que cache.put() refuse. On reconstruit une
 * réponse aux en-têtes assainis (statut/corps inchangés).
 */
function putCache(request, res) {
  if (!res || !res.ok) return Promise.resolve();
  return caches.open(VERSION).then((cache) => {
    let clean = res;
    try {
      const headers = new Headers(res.headers);
      headers.delete("cache-control");
      headers.delete("pragma");
      clean = new Response(res.clone().body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    } catch {
      clean = res.clone();
    }
    return cache.put(request, clean).catch(() => {});
  });
}

/**
 * Repli hors-ligne : le `?t=` de HMR (dev) change à chaque reload et casse
 * l'appariement exact. En dernier recours on apparie sans ce paramètre
 * (prod : URLs hashées stables, ce chemin ne sert jamais).
 */
async function matchLoose(request) {
  const exact = await caches.match(request);
  if (exact) return exact;
  const url = new URL(request.url);
  if (!url.searchParams.has("t")) return undefined;
  url.searchParams.delete("t");
  const target = url.toString();
  const cache = await caches.open(VERSION);
  const keys = await cache.keys();
  for (const k of keys) {
    const ku = new URL(k.url);
    ku.searchParams.delete("t");
    if (ku.toString() === target) return cache.match(k);
  }
  return undefined;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isBypass(url)) return;

  // Navigations : réseau d'abord, cache en repli (puis accueil en dernier recours).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          putCache(request, res.clone());
          return res;
        })
        .catch(() =>
          matchLoose(request).then((hit) => hit || caches.match("/").then((home) => home || Response.error())),
        ),
    );
    return;
  }

  // Assets : cache d'abord, réseau en fond (stale-while-revalidate).
  event.respondWith(
    caches.match(request).then((hit) => {
      const net = fetch(request)
        .then((res) => {
          putCache(request, res.clone());
          return res;
        })
        .catch(() => hit || matchLoose(request));
      return hit || net;
    }),
  );
});
