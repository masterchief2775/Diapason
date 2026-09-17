export type ThemeId = "braise" | "papier" | "minuit" | "foret" | "miku" | "teto" | "daltonien";

export const THEMES: { id: ThemeId; fr: string; en: string; bg: string; swatch: string }[] = [
  { id: "braise", fr: "Braise", en: "Ember", bg: "#14110f", swatch: "#d4c4a0" },
  { id: "papier", fr: "Papier", en: "Paper", bg: "#f6f1e5", swatch: "#7d6116" },
  { id: "minuit", fr: "Minuit", en: "Midnight", bg: "#0c1220", swatch: "#d9b45b" },
  { id: "foret", fr: "Forêt", en: "Forest", bg: "#0e1511", swatch: "#d4bc7a" },
  { id: "miku", fr: "Miku", en: "Miku", bg: "#0a1418", swatch: "#39c5cf" },
  { id: "teto", fr: "Teto", en: "Teto", bg: "#120d0d", swatch: "#e63b2e" },
  { id: "daltonien", fr: "Daltonien", en: "Colorblind-safe", bg: "#101012", swatch: "#56b4e9" },
];

const META_BG: Record<ThemeId, string> = {
  braise: "#14110F",
  papier: "#f6f1e5",
  minuit: "#0c1220",
  foret: "#0e1511",
  miku: "#0a1418",
  teto: "#120d0d",
  daltonien: "#101012",
};

/** Applique le thème au document (attribut + couleur du navigateur). */
export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  if (id === "braise") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.dataset.theme = id;
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", META_BG[id]);
}
