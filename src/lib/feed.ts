import { create } from "zustand";

export type ToastKind = "xp" | "badge" | "record" | "level";

export type Toast = {
  id: number;
  kind: ToastKind;
  /** Clé i18n (résolue au rendu) — ou texte déjà traduit (badges). */
  key: string;
  n?: number;
  sub?: string;
};

let nextId = 1;

type FeedState = {
  toasts: Toast[];
  push: (kind: ToastKind, key: string, opts?: { n?: number; sub?: string }) => void;
  dismiss: (id: number) => void;
};

/** Mini-store NON persisté : les récompenses du moment (XP, badges, records). */
export const useFeed = create<FeedState>()((set) => ({
  toasts: [],
  push: (kind, key, opts) =>
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id: nextId++, kind, key, ...opts }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function pushToast(kind: ToastKind, key: string, opts?: { n?: number; sub?: string }) {
  useFeed.getState().push(kind, key, opts);
}
