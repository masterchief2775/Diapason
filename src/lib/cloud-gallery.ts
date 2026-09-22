import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type GalleryPiece = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  keyRoot: number;
  mode: "majeure" | "mineure";
  progression: number[];
  melody: (number | null)[];
  mine: boolean;
  createdAt: string;
};

type GalleryRow = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  payload: {
    keyRoot: number;
    mode: "majeure" | "mineure";
    progression: number[];
    melody: (number | null)[];
  } | null;
  user_id: string;
  created_at: string;
};

function isMelodyValue(v: unknown): v is number | null {
  return v == null || (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 6);
}

function isPayload(v: unknown): v is GalleryRow["payload"] & {} {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    Number.isInteger(o.keyRoot) &&
    (o.keyRoot as number) >= 0 &&
    (o.keyRoot as number) <= 11 &&
    (o.mode === "majeure" || o.mode === "mineure") &&
    Array.isArray(o.progression) &&
    o.progression.length >= 2 &&
    o.progression.length <= 8 &&
    o.progression.every((d) => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6) &&
    Array.isArray(o.melody) &&
    (o.melody as unknown[]).every(isMelodyValue)
  );
}

/** Galerie publique : lecture ouverte (pas de données personnelles). */
export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<GalleryRow>`select id, title, author, genre, payload, user_id, created_at from shared_pieces order by created_at desc limit 60`;
  const out: GalleryPiece[] = [];
  for (const r of rows) {
    if (!isPayload(r.payload)) continue;
    out.push({
      id: r.id,
      title: r.title,
      author: r.author,
      genre: r.genre,
      keyRoot: r.payload.keyRoot,
      mode: r.payload.mode,
      progression: r.payload.progression,
      melody: r.payload.melody,
      mine: false,
      createdAt: r.created_at,
    });
  }
  return out;
});

/** Ids des morceaux publiés par l'utilisateur vérifié (pour le bouton Retirer). */
export const myPublishedIds = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`select id from shared_pieces where user_id = ${context.userId}`;
    return rows.map((r) => r.id);
  });

/** Publie un morceau (pseudo lu côté serveur depuis le compte vérifié). */
export const publishPiece = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (typeof input !== "object" || input === null) throw new Error("Invalid payload");
    const o = input as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim().slice(0, 60) : "";
    if (!title) throw new Error("Invalid title");
    if (!Number.isInteger(o.keyRoot) || (o.keyRoot as number) < 0 || (o.keyRoot as number) > 11) {
      throw new Error("Invalid payload");
    }
    if (o.mode !== "majeure" && o.mode !== "mineure") {
      throw new Error("Invalid payload");
    }
    if (!Array.isArray(o.progression)) throw new Error("Invalid progression");
    // Filtrer D'ABORD, contrôler la longueur APRÈS : sinon [0, 99, "x"]
    // passe le contrôle puis stocke une grille vide.
    const progression = (o.progression as unknown[])
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 0 && n < 7);
    if (progression.length < 2 || progression.length > 8) throw new Error("Invalid progression");
    if (!Array.isArray(o.melody)) throw new Error("Invalid melody");
    const melody = (o.melody as unknown[]).slice(0, 8).map((m) => {
      if (m == null) return null;
      const n = Number(m);
      return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
    });
    return {
      id: typeof o.id === "string" && o.id.length < 64 ? o.id : Math.random().toString(36).slice(2),
      title,
      keyRoot: o.keyRoot as number,
      mode: o.mode,
      progression,
      melody,
      genre: typeof o.genre === "string" ? o.genre.slice(0, 32) : null,
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const users = await sql<{ name: string }>`select "name" from "user" where id = ${context.userId}`;
    const author = users[0]?.name?.slice(0, 40) || "Anonyme";
    const payload = JSON.stringify({ keyRoot: data.keyRoot, mode: data.mode, progression: data.progression, melody: data.melody });
    // Republication d'une pièce modifiée : mise à jour si on en est l'auteur,
    // refus sinon (pas d'écrasement inter-utilisateurs sur collision d'id).
    const existing = await sql<{ user_id: string }>`select user_id from shared_pieces where id = ${data.id}`;
    if (existing.length > 0 && existing[0].user_id !== context.userId) {
      throw new Error("Not your piece");
    }
    if (existing.length > 0) {
      await sql`update shared_pieces set title = ${data.title}, author = ${author}, genre = ${data.genre}, payload = ${payload}::jsonb where id = ${data.id} and user_id = ${context.userId}`;
    } else {
      await sql`insert into shared_pieces (id, user_id, title, author, genre, payload)
        values (${data.id}, ${context.userId}, ${data.title}, ${author}, ${data.genre}, ${payload}::jsonb)`;
    }
    return { ok: true as const };
  });

/** Retire son propre morceau (propriété vérifiée). */
export const unpublishPiece = createServerFn({ method: "POST" })
  .validator((id: unknown) => {
    if (typeof id !== "string" || !id) throw new Error("Invalid id");
    return id;
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from shared_pieces where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
