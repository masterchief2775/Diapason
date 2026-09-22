import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { CloudProgress } from "@/lib/progress";

type ProgressRow = { data: CloudProgress };

function isRecord(v: unknown): v is Record<string, number> {
  if (typeof v !== "object" || v === null) return false;
  return Object.values(v as Record<string, unknown>).every((x) => typeof x === "number");
}

function isCloudProgress(v: unknown): v is CloudProgress {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    Array.isArray(o.completed) &&
    o.completed.every((x) => typeof x === "string") &&
    isRecord(o.scores) &&
    typeof o.xp === "number" &&
    typeof o.streak === "number" &&
    (o.lastVisit === null || typeof o.lastVisit === "string") &&
    Array.isArray(o.pieces) &&
    isRecord(o.challenges) &&
    isRecord(o.bestScores) &&
    isRecord(o.activity) &&
    (o.level === null || typeof o.level === "string") &&
    typeof o.updatedAt === "number"
  );
}

/** Copie cloud de la progression (null si jamais synchronisée). */
export const getCloudProgress = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<ProgressRow>`select data from user_progress where user_id = ${context.userId}`;
    const data = rows[0]?.data ?? null;
    return data && isCloudProgress(data) ? data : null;
  });

/** Écrase la copie cloud (last-write-wins, scoped au user vérifié). */
export const saveCloudProgress = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!isCloudProgress(data)) throw new Error("Invalid progress payload");
    return data;
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`insert into user_progress (user_id, data, updated_at)
      values (${context.userId}, ${JSON.stringify(data)}::jsonb, now())
      on conflict (user_id) do update set data = excluded.data, updated_at = now()`;
    return { ok: true as const };
  });

/** Supprime la copie cloud de l'utilisateur vérifié. */
export const deleteCloudProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from user_progress where user_id = ${context.userId}`;
    return { ok: true as const };
  });
