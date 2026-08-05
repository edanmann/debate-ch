"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAppState } from "@/lib/store";
import { CloseIcon, MenuIcon } from "./icons";
import {
  AnalyseColor,
  BotColor,
  DebateColor,
  HomeColor,
  DiscordGlyph,
  FriendsColor,
  HistoryColor,
  InstagramGlyph,
  LearnColor,
  LogoMark,
  ProfileColor,
  PuzzleColor,
  SettingsColor,
  TikTokGlyph,
  WatchColor,
  XGlyph,
  YouTubeGlyph,
} from "./color-icons";
import { ButtonLink } from "./ui";

/**
 * Adaptive chrome: marketing header/footer for guests, app rail + mobile
 * bottom navigation once signed in. The live debate room runs chrome-free so
 * nothing competes with the timer.
 */

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
      <LogoMark className="h-8 w-8" />
      <span className="text-lg">
        Debates<span className="text-brand">.ch</span>
      </span>
    </Link>
  );
}

const MAIN_NAV = [
  { href: "/home", label: "Home", icon: HomeColor },
  { href: "/debate", label: "Debate", icon: DebateColor },
  { href: "/bots", label: "Bots", icon: BotColor },
  { href: "/lessons", label: "Learn", icon: LearnColor },
  { href: "/puzzles", label: "Puzzles", icon: PuzzleColor },
  { href: "/watch", label: "Watch", icon: WatchColor },
  { href: "/analyse", label: "Analyse", icon: AnalyseColor },
  { href: "/friends", label: "Friends", icon: FriendsColor },
  { href: "/profile/me", label: "Profile", icon: ProfileColor },
];

const MOBILE_NAV = [
  MAIN_NAV[0],
  MAIN_NAV[1],
  MAIN_NAV[2],
  MAIN_NAV[4],
  MAIN_NAV[5],
];
const MORE_NAV = [
  MAIN_NAV[3],
  MAIN_NAV[6],
  MAIN_NAV[7],
  MAIN_NAV[8],
  { href: "/history", label: "History", icon: HistoryColor },
  { href: "/settings", label: "Settings", icon: SettingsColor },
];

const GUEST_NAV = [
  { href: "/debate", label: "Debate" },
  { href: "/bots", label: "Bots" },
  { href: "/lessons", label: "Learn" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/watch", label: "Watch" },
  { href: "/analyse", label: "Analyse" },
];

function GuestHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {GUEST_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup" size="sm">
            Sign up free
          </ButtonLink>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-surface-2 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <nav
          className="border-t border-border-subtle px-4 pb-4 md:hidden"
          aria-label="Mobile"
        >
          {GUEST_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            <ButtonLink href="/login" variant="secondary" size="md" className="flex-1">
              Log in
            </ButtonLink>
            <ButtonLink href="/signup" size="md" className="flex-1">
              Sign up free
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}

const SOCIALS = [
  { label: "X", Glyph: XGlyph },
  { label: "TikTok", Glyph: TikTokGlyph },
  { label: "YouTube", Glyph: YouTubeGlyph },
  { label: "Instagram", Glyph: InstagramGlyph },
  { label: "Discord", Glyph: DiscordGlyph },
];

export function Footer() {
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: "Product",
      links: [
        ["Debate", "/debate"],
        ["Bots", "/bots"],
        ["Lessons", "/lessons"],
        ["Puzzles", "/puzzles"],
        ["Watch", "/watch"],
        ["Analyse", "/analyse"],
      ],
    },
    {
      title: "Company",
      links: [
        ["About", "/about"],
        ["Safety", "/safety"],
      ],
    },
    {
      title: "Legal",
      links: [
        ["Terms", "/terms"],
        ["Privacy", "/privacy"],
      ],
    },
  ];
  return (
    <footer className="border-t border-border-subtle bg-surface-1/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-fg-muted">
            Debate anyone. Improve every round.
          </p>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map(({ label, Glyph }) => (
              <span
                key={label}
                className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-lg border border-border-subtle text-fg-muted"
                title={`${label} — coming soon`}
              >
                <Glyph className="h-4.5 w-4.5" />
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <span className="cursor-not-allowed rounded-lg border border-border-subtle px-3 py-2 text-xs text-fg-faint">
              App Store — coming soon
            </span>
            <span className="cursor-not-allowed rounded-lg border border-border-subtle px-3 py-2 text-xs text-fg-faint">
              Google Play — coming soon
            </span>
          </div>
        </div>
        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="text-sm text-fg-muted hover:text-fg"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border-subtle py-5 text-center text-xs text-fg-faint">
        <p className="mx-auto max-w-3xl px-4">
          © {new Date().getFullYear()} Debates.ch
        </p>
      </div>
    </footer>
  );
}

function RailLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-surface-2 text-fg"
          : "text-fg-muted hover:bg-surface-2/60 hover:text-fg"
      }`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      {label}
    </Link>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/home" ? pathname === "/home" : pathname.startsWith(href);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[90rem]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border-subtle p-4 lg:flex">
        <Logo />
        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Main">
          {MAIN_NAV.map((item) => (
            <RailLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <RailLink
            href="/history"
            label="History"
            icon={HistoryColor}
            active={isActive("/history")}
          />
          <RailLink
            href="/settings"
            label="Settings"
            icon={SettingsColor}
            active={isActive("/settings")}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-background/90 px-4 backdrop-blur lg:hidden">
          <Logo />
          <Link
            href="/settings"
            className="rounded-lg p-2 hover:bg-surface-2"
            aria-label="Settings"
          >
            <SettingsColor className="h-5 w-5" />
          </Link>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">{children}</main>

        {/* Mobile bottom nav */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-1/95 backdrop-blur lg:hidden"
          aria-label="Bottom"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="grid grid-cols-6">
            {MOBILE_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                    active ? "text-fg" : "text-fg-muted"
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-fg-muted"
              aria-haspopup="dialog"
            >
              <MenuIcon className="h-6 w-6" />
              More
            </button>
          </div>
        </nav>

        {/* Mobile "More" sheet */}
        {moreOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="More navigation"
            onClick={() => setMoreOpen(false)}
          >
            <div
              className="w-full rounded-t-2xl border-t border-border-subtle bg-surface-1 p-4 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">More</p>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="rounded-lg p-2 text-fg-muted hover:bg-surface-2"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-3 text-sm font-semibold"
                  >
                    <item.icon className="h-6 w-6" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAppState();

  // The debate room manages its own full-screen layout.
  if (pathname.startsWith("/debate/room/")) {
    return <>{children}</>;
  }

  if (user) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <GuestHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
