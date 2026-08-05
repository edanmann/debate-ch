import type { Metadata } from "next";
import Link from "next/link";
import {
  BotColor,
  CoachColor,
  FriendsColor,
  OnlineColor,
  TimerColor,
} from "@/components/color-icons";
import { FORMATS } from "@/lib/formats";

export const metadata: Metadata = { title: "Debate" };

const MODES = [
  {
    href: "/debate/quick",
    title: "Debate 10 Minutes",
    sub: "Rapid format, random motion, random side. The daily bread.",
    icon: TimerColor,
  },
  {
    href: "/debate/online",
    title: "Debate Online",
    sub: "Rated rounds against people. Instant matchmaking is on its way.",
    icon: OnlineColor,
  },
  {
    href: "/bots",
    title: "Debate Bots",
    sub: "45 opponents with real strengths and exploitable weaknesses.",
    icon: BotColor,
  },
  {
    href: "/coach",
    title: "Debate Coach",
    sub: "Choose a bot coach for practice-mode guidance.",
    icon: CoachColor,
  },
  {
    href: "/debate/friend",
    title: "Debate a Friend",
    sub: "Invite by link to a private lobby with custom rules.",
    icon: FriendsColor,
  },
];

export default function DebateHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Debate</h1>
      <p className="mt-2 text-fg-muted">
        Pick how you want to play. Standard rated debates assign the motion and
        your side — that&apos;s the sport.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-surface-1 p-5 transition-colors hover:border-brand/40 hover:bg-surface-2"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-3">
              <m.icon className="h-8 w-8" />
            </span>
            <span>
              <span className="block font-bold">{m.title}</span>
              <span className="block text-sm text-fg-muted">{m.sub}</span>
            </span>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold">Formats</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FORMATS.map((f) => (
          <div key={f.id} className="rounded-2xl border border-border-subtle bg-surface-1 p-4">
            <div className="flex items-baseline justify-between">
              <p className="font-bold">{f.name}</p>
              <p className="numeric text-sm text-fg-muted">{f.approxTotalLabel}</p>
            </div>
            <p className="mt-1 text-sm text-fg-muted">{f.tagline}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-fg-faint">
              {f.phases.map((p) => (
                <li key={p.id}>
                  {p.name} · {Math.round(p.durationSec / 60) > 0 ? `${Math.floor(p.durationSec / 60)}m` : ""}
                  {p.durationSec % 60 > 0 ? ` ${p.durationSec % 60}s` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
