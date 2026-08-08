import { BOT_PRESENTATION } from "./bot-presentation";

/**
 * The coach is a companion, not the player's face: it appears beside the
 * overall rating, in popups and in debate reviews.
 */
export const DEFAULT_COACH_SLUG = "donald-trump";

/** Preselected opponent in the directory. */
export const DEFAULT_OPPONENT_SLUG = "donald-trump";

/** Pretty name from a slug, for when only the slug is stored. */
export function coachNameFromSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  if (!(slug in BOT_PRESENTATION)) return null;
  return slug
    .split("-")
    .map((w) => (w === "the" ? "The" : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}
