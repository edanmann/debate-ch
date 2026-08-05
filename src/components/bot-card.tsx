import Link from "next/link";
import type { BotCardData } from "@/lib/types";
import { BotFace, botFlag } from "./bot-face";
import { SixStatBars } from "./stats";

/**
 * Bot card on the light "board" surface used across the landing page.
 * The rating is the headline number, so it carries the largest type here.
 */
export function BotCard({ bot }: { bot: BotCardData }) {
  const flag = botFlag(bot.slug);
  return (
    <Link
      href={`/bots/${bot.slug}`}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 text-ink shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start gap-3">
        <BotFace slug={bot.slug} name={bot.name} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold leading-tight">
            {bot.name} {flag ?? ""}
          </p>
          <p className="truncate text-xs font-semibold text-ink-muted">
            {bot.archetype}
          </p>
          <span className="mt-1 inline-block rounded-full bg-board-2 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-ink-muted">
            {bot.category.replace(" - Planned", "")}
          </span>
        </div>
        {bot.overallRating != null && (
          <div className="shrink-0 text-center">
            <p className="numeric text-4xl font-black leading-none text-[#5d8a3a]">
              {bot.overallRating}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-ink-muted">
              Rating
            </p>
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-sm text-ink-muted">{bot.oneLineSummary}</p>
      {bot.stats && <SixStatBars stats={bot.stats} compact light />}
      {bot.mainWeakness && (
        <p className="text-xs text-ink-muted">
          Weakness: <span className="font-semibold">{bot.mainWeakness}</span>
        </p>
      )}
    </Link>
  );
}
