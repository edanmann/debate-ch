import rawMotions from "@/data/motions.json";
import { motionLibrarySchema } from "./schemas";
import type { Motion } from "./types";

let cache: Motion[] | null = null;

export function getMotions(): Motion[] {
  if (!cache) {
    cache = motionLibrarySchema.parse(rawMotions) as Motion[];
  }
  return cache.filter((m) => m.status === "approved");
}

export function getMotionById(id: string): Motion | null {
  return getMotions().find((m) => m.id === id) ?? null;
}

/**
 * Pick a motion the app chooses (spec §12): standard rated debates never let
 * the user reroll for a preferred motion or side. Shuffle without replacement
 * against a list of already-seen motion ids kept by the caller.
 */
export function drawMotion(seenIds: string[], category?: string): Motion {
  let pool = getMotions().filter((m) => !m.sensitive);
  if (category) {
    const inCategory = pool.filter((m) => m.category === category);
    if (inCategory.length > 0) pool = inCategory;
  }
  const unseen = pool.filter((m) => !seenIds.includes(m.id));
  const effective = unseen.length > 0 ? unseen : pool;
  return effective[Math.floor(Math.random() * effective.length)];
}

export function drawSide(): "for" | "against" {
  return Math.random() < 0.5 ? "for" : "against";
}

/** Full approved library, safe to import from client components. */
export function getAllMotions(): Motion[] {
  return getMotions();
}

/** Draw honouring the player's optional topic/difficulty preferences. */
export function drawMotionWithPrefs(
  seenIds: string[],
  prefs: { category: string | null; maxDifficulty: number | null },
  downvoted: string[] = []
): Motion {
  let pool = getMotions().filter(
    (m) => !m.sensitive && !downvoted.includes(m.id)
  );
  if (prefs.category) {
    const inCat = pool.filter((m) => m.category === prefs.category);
    if (inCat.length) pool = inCat;
  }
  if (prefs.maxDifficulty) {
    const easier = pool.filter((m) => m.difficulty <= prefs.maxDifficulty!);
    if (easier.length) pool = easier;
  }
  const unseen = pool.filter((m) => !seenIds.includes(m.id));
  const effective = unseen.length ? unseen : pool;
  return effective[Math.floor(Math.random() * effective.length)];
}
