"use client";

import Link from "next/link";
import { useState } from "react";
import { updateState, useAppState } from "@/lib/store";
import { BotFace } from "@/components/bot-face";
import RequireAuth from "@/components/require-auth";
import { Badge, ButtonLink, buttonClass, EmptyState } from "@/components/ui";

const RESULT_FILTERS = ["all", "won", "lost", "too-close", "unfinished"] as const;

function History() {
  const { debates } = useAppState();
  const [result, setResult] = useState<(typeof RESULT_FILTERS)[number]>("all");
  const [formatId, setFormatId] = useState("all");
  const [rated, setRated] = useState("all");

  const filtered = debates.filter((d) => {
    if (formatId !== "all" && d.formatId !== formatId) return false;
    if (rated !== "all" && String(d.rated) !== rated) return false;
    switch (result) {
      case "won":
        return d.judgement?.winner === "user";
      case "lost":
        return d.judgement?.winner === "bot";
      case "too-close":
        return d.judgement?.winner === "too-close";
      case "unfinished":
        return d.status !== "complete";
      default:
        return true;
    }
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight">History</h1>
      {debates.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No debate history"
            body="Every round you play is saved here with its result, transcript and rating change."
            action={<ButtonLink href="/debate/quick">Play your first round</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {RESULT_FILTERS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                aria-pressed={result === r}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${
                  result === r
                    ? "bg-brand text-[#1e2313]"
                    : "bg-surface-2 text-fg-muted hover:bg-surface-3"
                }`}
              >
                {r.replace("-", " ")}
              </button>
            ))}
            <select
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              aria-label="Filter by format"
              className="rounded-full bg-surface-2 px-3 py-1.5 text-sm text-fg-muted outline-none"
            >
              <option value="all">All formats</option>
              {["bullet", "blitz", "rapid", "classic", "marathon"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <select
              value={rated}
              onChange={(e) => setRated(e.target.value)}
              aria-label="Filter rated or practice"
              className="rounded-full bg-surface-2 px-3 py-1.5 text-sm text-fg-muted outline-none"
            >
              <option value="all">Rated + practice</option>
              <option value="true">Rated only</option>
              <option value="false">Practice only</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No matches" body="No debates match these filters." />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-3"
                >
                  <BotFace slug={d.botSlug} name={d.botName} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      vs {d.botName}
                      <span className="ml-2 text-xs font-normal text-fg-muted">
                        {d.userSide} · {d.formatId} · {d.difficulty} ·{" "}
                        {d.rated ? "rated" : "practice"}
                      </span>
                    </p>
                    <p className="truncate text-xs text-fg-muted">{d.motionText}</p>
                  </div>
                  {d.judgement ? (
                    <Badge
                      tone={
                        d.judgement.winner === "user"
                          ? "brand"
                          : d.judgement.winner === "bot"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {d.judgement.winner === "user"
                        ? "Won"
                        : d.judgement.winner === "bot"
                          ? "Lost"
                          : "Too close"}
                    </Badge>
                  ) : (
                    <Badge>{d.status === "abandoned" ? "Abandoned" : "In progress"}</Badge>
                  )}
                  <Link
                    href={
                      d.status === "complete"
                        ? `/debate/results/${d.id}`
                        : `/debate/room/${d.id}`
                    }
                    className={buttonClass("secondary", "sm")}
                  >
                    {d.status === "complete" ? "Review" : d.status === "abandoned" ? "View" : "Resume"}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Delete debate vs ${d.botName}`}
                    onClick={() =>
                      updateState((s) => ({
                        ...s,
                        debates: s.debates.filter((x) => x.id !== d.id),
                      }))
                    }
                    className={buttonClass("ghost", "sm")}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <RequireAuth>
      <History />
    </RequireAuth>
  );
}
