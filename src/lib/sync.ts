import { toCloudProgress, useProgress, type CloudProgress } from "./progress";
import { deleteCloudProgress, getCloudProgress, saveCloudProgress } from "./cloud-progress";

export type SyncOutcome =
  | { status: "pushed" }
  | { status: "pulled" }
  | { status: "up-to-date" }
  | { status: "empty" };

function markSynced() {
  useProgress.getState().setLastSyncAt(Date.now());
}

/**
 * Fusion champ par champ (pull) : le perdant du last-write-wins ne perd
 * plus ses XP/scores — union des complétions et pièces, max des compteurs.
 * Le niveau (préférence) suit le côté le plus récent.
 */
function mergeProgress(local: CloudProgress, cloud: CloudProgress): CloudProgress {
  const maxRec = (...recs: Record<string, number>[]) => {
    const out: Record<string, number> = {};
    for (const r of recs) for (const [k, v] of Object.entries(r)) out[k] = Math.max(out[k] ?? -Infinity, v);
    return out;
  };
  const byId = new Map<string, CloudProgress["pieces"][number]>();
  for (const p of [...local.pieces, ...cloud.pieces]) byId.set(p.id, p);
  return {
    completed: [...new Set([...local.completed, ...cloud.completed])],
    scores: maxRec(local.scores, cloud.scores),
    xp: Math.max(local.xp, cloud.xp),
    streak: Math.max(local.streak, cloud.streak),
    lastVisit:
      local.lastVisit == null ? cloud.lastVisit : cloud.lastVisit == null ? local.lastVisit : cloud.updatedAt >= local.updatedAt ? cloud.lastVisit : local.lastVisit,
    pieces: [...byId.values()],
    challenges: maxRec(local.challenges, cloud.challenges),
    bestScores: maxRec(local.bestScores, cloud.bestScores),
    activity: maxRec(local.activity, cloud.activity),
    level: cloud.updatedAt >= local.updatedAt ? cloud.level : local.level,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  };
}

/**
 * Synchronisation last-write-wins par horodatage :
 * - cloud vide → pousse le local (sauf profil local vide aussi → "empty")
 * - local plus récent → pousse ; cloud plus récent → tire ; égaux → à jour.
 */
export async function syncProgress(): Promise<SyncOutcome> {
  const local = toCloudProgress(useProgress.getState());
  let cloud: Awaited<ReturnType<typeof getCloudProgress>> = null;
  try {
    cloud = await getCloudProgress();
  } catch (e) {
    // signOut() rejette côté serveur quand déconnecté ; le réseau coupé
    // n'est pas une désauthentification — l'appelant distingue les deux.
    const offline = e instanceof TypeError || /fetch|network|offline/i.test(String((e as Error)?.message ?? e));
    throw new Error(offline ? "offline" : "unauthorized");
  }
  if (!cloud) {
    if (local.updatedAt === 0 && local.xp === 0 && local.completed.length === 0) {
      markSynced();
      return { status: "empty" };
    }
    await saveCloudProgress({ data: local });
    lastPushedAt = local.updatedAt;
    markSynced();
    return { status: "pushed" };
  }
  if (local.updatedAt > cloud.updatedAt) {
    await saveCloudProgress({ data: local });
    lastPushedAt = local.updatedAt;
    markSynced();
    return { status: "pushed" };
  }
  if (cloud.updatedAt > local.updatedAt) {
    // Fusion plutôt qu'écrasement : le local récent mais perdant garde ses gains.
    const merged = mergeProgress(local, cloud);
    useProgress.getState().hydrateFromCloud(merged);
    // La copie tirée devient la référence : pas de re-push immédiat.
    lastPushedAt = merged.updatedAt;
    markSynced();
    // Converge le cloud vers la fusion (best-effort, hors-ligne toléré).
    try {
      await saveCloudProgress({ data: merged });
    } catch {
      /* réessaiera à la prochaine mutation */
    }
    return { status: "pulled" };
  }
  markSynced();
  return { status: "up-to-date" };
}

export async function eraseCloud(): Promise<void> {
  await deleteCloudProgress();
  // Référence = l'état local actuel : la suppression ne ressuscite pas
  // l'ancien snapshot au prochain push, mais les futurs gains re-synceront.
  lastPushedAt = useProgress.getState().updatedAt;
  useProgress.getState().setLastSyncAt(null);
}

/** Pousse si le local a bougé depuis la dernière sync (anti-boucle : compare updatedAt). */
let pushTimer: number | undefined;
let lastPushedAt = 0;

export function schedulePush() {
  if (pushTimer !== undefined) return;
  pushTimer = window.setTimeout(() => {
    pushTimer = undefined;
    void (async () => {
      const s = useProgress.getState();
      if (s.updatedAt <= lastPushedAt || s.updatedAt === 0) return;
      try {
        await saveCloudProgress({ data: toCloudProgress(s) });
        lastPushedAt = s.updatedAt;
        s.setLastSyncAt(Date.now());
      } catch {
        /* hors-ligne ou déconnecté : réessaiera à la prochaine mutation */
      }
    })();
  }, 4000);
}

/** Abonne le push différé aux mutations (à appeler une fois, quand connecté). */
export function watchLocalChanges(): () => void {
  let prev = useProgress.getState().updatedAt;
  return useProgress.subscribe((s) => {
    if (s.updatedAt !== prev) {
      prev = s.updatedAt;
      schedulePush();
    }
  });
}
