"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { botFlag } from "@/components/bot-face";
import { BotFace } from "@/components/bot-face";
import { groupBots } from "@/lib/bot-groups";
import { FORMATS } from "@/lib/formats";
import { createDebate } from "@/lib/debate";
import { formatOvr } from "@/lib/rating";
import { useAppState } from "@/lib/store";
import type { BotCardData } from "@/lib/types";
import { UserFace } from "@/components/user-face";
import { buttonClass } from "@/components/ui";

/**
 * Bot directory in the arcade "pick your opponent" pattern: a player header,
 * collapsible category shelves of avatar tiles, and a sticky format + Play bar.
 */

function Tile({
  bot,
  selected,
  onSelect,
}: {
  bot: BotCardData;
  selected: boolean;
  onSelect: () => void;
}) {
  const flag = botFlag(bot.slug);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={`${bot.name} (${bot.overallRating ?? "—"})`}
      className={`group relative flex flex-col items-center rounded-xl p-1.5 transition-all ${
        selected
          ? "bg-brand/15 ring-2 ring-brand"
          : "hover:-translate-y-0.5 hover:bg-surface-2"
      }`}
    >
      <BotFace slug={bot.slug} name={bot.name} size={72} className="rounded-xl" />
      <span className="mt-1 max-w-[5.5rem] truncate text-[11px] font-bold">
        {bot.name}
      </span>
      <span className="numeric text-[11px] text-fg-muted">
        {bot.overallRating ?? "—"} {flag ?? ""}
      </span>
    </button>
  );
}

export default function BotDirectory({ bots }: { bots: BotCardData[] }) {
  const router = useRouter();
  const { user, overallElo } = useAppState();
  const groups = useMemo(() => groupBots(bots), [bots]);

  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<string>(groups[0]?.name ?? "");
  const [selected, setSelected] = useState<BotCardData | null>(
    groups[0]?.bots[0] ?? null
  );
  const [formatId, setFormatId] = useState("rapid");
  const [starting, setStarting] = useState(false);

  const searching = query.trim().length > 0;
  const searchResults = searching
    ? bots.filter((b) =>
        `${b.name} ${b.archetype}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  function play() {
    if (!selected) return;
    if (!user) {
      router.push("/signup");
      return;
    }
    setStarting(true);
    const debate = createDebate({
      botSlug: selected.slug,
      botName: selected.name,
      difficulty: "standard",
      formatId,
      rated: true,
      mode: "audio",
    });
    router.push(`/debate/room/${debate.id}`);
  }

  return (
    // Bottom padding clears the sticky play bar, which is taller on phones
    // because its controls wrap onto separate rows.
    <div className="pb-52 sm:pb-32">
      {/* Selected-opponent header */}
      <div className="flex items-center gap-4 rounded-2xl bg-surface-1 p-4">
        {selected ? (
          <>
            <BotFace slug={selected.slug} name={selected.name} size={96} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-2xl font-black">
                {selected.name}
                <span className="numeric text-fg-muted">
                  {selected.overallRating ?? "—"}
                </span>
                <span className="text-xl">{botFlag(selected.slug) ?? ""}</span>
              </p>
              <p className="text-sm text-fg-muted">{selected.archetype}</p>
              <p className="mt-1 line-clamp-2 max-w-xl text-xs text-fg-faint">
                {selected.oneLineSummary}
              </p>
              <a
                href={`/bots/${selected.slug}`}
                className="mt-1 inline-block text-xs font-semibold text-brand hover:underline"
              >
                Full profile →
              </a>
            </div>
          </>
        ) : (
          <p className="text-fg-muted">Pick an opponent below.</p>
        )}
        <div className="ml-auto hidden shrink-0 text-center sm:block">
          <UserFace size={56} className="mx-auto" />
          <p className="mt-1 text-xs font-bold">{user?.displayName ?? "Guest"}</p>
          <p className="numeric text-xs text-fg-muted">{formatOvr(overallElo)}</p>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search all 45 bots…"
        aria-label="Search bots"
        className="mt-4 w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand"
      />

      {/* Search results */}
      {searching ? (
        <div className="mt-4 rounded-2xl bg-surface-1 p-4">
          <p className="mb-3 text-sm font-bold text-fg-muted">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {searchResults.map((bot) => (
              <Tile
                key={bot.slug}
                bot={bot}
                selected={selected?.slug === bot.slug}
                onSelect={() => setSelected(bot)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Category shelves */
        <div className="mt-4 space-y-2">
          {groups.map((group) => {
            const open = openGroup === group.name;
            return (
              <section key={group.name} className="rounded-2xl bg-surface-1">
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? "" : group.name)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-surface-2"
                >
                  <BotFace
                    slug={group.bots[0].slug}
                    name={group.bots[0].name}
                    size={40}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-black">{group.name}</span>
                    <span className="block truncate text-xs text-fg-muted">
                      {group.blurb}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-fg-muted">
                    {group.bots.length} bot{group.bots.length === 1 ? "" : "s"}
                  </span>
                  <span
                    className={`shrink-0 text-fg-muted transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                {open && (
                  <div className="grid grid-cols-3 gap-2 px-3 pb-4 sm:grid-cols-5 lg:grid-cols-8">
                    {group.bots.map((bot) => (
                      <Tile
                        key={bot.slug}
                        bot={bot}
                        selected={selected?.slug === bot.slug}
                        onSelect={() => setSelected(bot)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Sticky play bar */}
      {/* Signed-in phones already have the app's bottom nav at bottom-0, so the
          play bar sits above it; guests and desktop keep it flush. */}
      <div
        className={`fixed inset-x-0 z-30 border-t border-border-subtle bg-surface-1/95 p-3 backdrop-blur lg:bottom-0 lg:pl-60 ${
          user ? "bottom-[4.25rem] lg:bottom-0" : "bottom-0"
        }`}
        style={{
          paddingBottom: user
            ? "0.75rem"
            : "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2">
          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value)}
            aria-label="Format"
            className="rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm font-semibold outline-none focus:border-brand"
          >
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} · {f.approxTotalLabel}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={play}
            disabled={!selected || starting}
            className={`${buttonClass("primary", "lg")} min-w-40 flex-1`}
          >
            {starting
              ? "Starting…"
              : user
                ? `Debate ${selected?.name ?? ""}`
                : "Sign up to debate"}
          </button>
        </div>
      </div>
    </div>
  );
}
