"use client";

import Link from "next/link";
import { flagFor } from "@/lib/flags-emoji";
import { formatOvr, tierForRating } from "@/lib/rating";
import { SKILL_KEYS, SKILL_LABELS, type RatingState } from "@/lib/types";
import { BotFace } from "./bot-face";
import { UserFace } from "./user-face";

/**
 * The Debates.ch progression card. The face is always the *player's* own
 * character; a selected coach rides along as a small companion beside the
 * overall rating rather than replacing the player.
 */

const TIER_STYLES: Record<string, string> = {
  dark: "from-[#3a3733] to-[#242220] border-border-subtle",
  "dark-bronze": "from-[#4a3526] to-[#2b1f16] border-[#7a5a3a]",
  "light-bronze": "from-[#6b4d2e] to-[#3a2b1a] border-[#a87e4f]",
  silver: "from-[#5d6165] to-[#33363a] border-[#9aa1a8]",
  "dark-gold": "from-[#6e5a1e] to-[#3b3111] border-[#b89a3e]",
  "light-gold": "from-[#8f7a2a] to-[#4c4116] border-[#e0c964]",
};

export function PlayerCard({
  name,
  country,
  overall,
  ratings,
  coachName,
  coachSlug,
  href = "/stats",
}: {
  name: string;
  country: string;
  overall: number;
  ratings: RatingState;
  coachName?: string | null;
  coachSlug?: string | null;
  href?: string;
}) {
  const tier = tierForRating(Math.floor(overall));

  return (
    <Link
      href={href}
      aria-label={`Your player card, overall ${formatOvr(overall)}, tier ${tier.label}. Open detailed stats.`}
      className={`block w-full max-w-sm rounded-3xl border-2 bg-gradient-to-b p-5 transition-transform hover:-translate-y-0.5 ${TIER_STYLES[tier.id]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-end gap-2">
            <p className="numeric text-5xl font-black leading-none">
              {formatOvr(overall)}
            </p>
            {/* Coach rides beside the rating as a friendly companion. */}
            {coachSlug && (
              <span
                className="mb-1 flex flex-col items-center"
                title={`${coachName ?? "Coach"} is your coach`}
              >
                <BotFace
                  slug={coachSlug}
                  name={coachName ?? "Coach"}
                  size={30}
                  className="rounded-lg ring-2 ring-brand/60"
                />
                <span className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-brand">
                  Coach
                </span>
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-fg-muted">
            OVR · {tier.label}
          </p>
        </div>
        <UserFace name={name} size={72} />
      </div>
      <div className="mt-4 border-t border-white/10 pt-3 text-center">
        <p className="truncate text-xl font-extrabold tracking-tight">{name}</p>
        <p className="mt-0.5 text-2xl" aria-label={country || "No country"}>
          {flagFor(country)}
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-2">
        {SKILL_KEYS.map((key) => (
          <div key={key} className="flex items-baseline justify-between gap-1">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-fg-muted">
              {SKILL_LABELS[key].slice(0, 4)}
            </dt>
            <dd className="numeric text-base font-bold">{ratings[key].rating}</dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}
