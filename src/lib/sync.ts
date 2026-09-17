import { toCloudProgress, useProgress } from "./progress";
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
 * Synchronisation last-write-wins par horodatage :
 * - cloud vide → pousse le local (sauf profil local vide aussi → "empty")
 * - local plus récent → pousse ; cloud plus récent → tire ; égaux → à jour.
 */
export async function syncProgress(): Promise<SyncOutcome> {
  const local = toCloudProgress(useProgress.getState());
  let cloud: Awaited<ReturnType<typeof getCloudProgress>> = null;
  try {
    cloud = await getCloudProgress();
  } catch {
    // signOut() rejette côté serveur quand déconnecté : traité par l'appelant.
    throw new Error("unauthorized");
  }
  if (!cloud) {
    if (local.updatedAt === 0 && local.xp === 0 && local.completed.length === 0) {
      markSynced();
      return { status: "empty" };
    }
    await saveCloudProgress({ data: local });
    markSynced();
    return { status: "pushed" };
  }
  if (local.updatedAt > cloud.updatedAt) {
    await saveCloudProgress({ data: local });
    markSynced();
    return { status: "pushed" };
  }
  if (cloud.updatedAt > local.updatedAt) {
    useProgress.getState().hydrateFromCloud(cloud);
    markSynced();
    return { status: "pulled" };
  }
  markSynced();
  return { status: "up-to-date" };
}

export async function eraseCloud(): Promise<void> {
  await deleteCloudProgress();
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
