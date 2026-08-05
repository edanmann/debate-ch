"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { flagFor } from "@/lib/flags-emoji";
import {
  defaultState,
  getState,
  logOut,
  updateState,
  useAppState,
} from "@/lib/store";
import RequireAuth from "@/components/require-auth";
import { logOutServer, pushProgress } from "@/lib/auth/client";
import { getAllMotions } from "@/lib/motions";
import { setTheme } from "@/components/theme";
import { AvatarBuilder, DEFAULT_USER_AVATAR } from "@/components/avatar-builder";
import type { AvatarConfig } from "@/components/cartoon-avatar";
import { MotionDirectory } from "@/components/settings/motion-directory";
import { CELEBRATIONS } from "@/components/celebration";
import { buttonClass, Card, SectionTitle } from "@/components/ui";

function Settings() {
  const router = useRouter();
  const state = useAppState();
  const user = state.user!;
  const [name, setName] = useState(user.displayName);
  const [country, setCountry] = useState(user.country);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>(user.avatar ?? DEFAULT_USER_AVATAR);
  const motions = getAllMotions();

  function save() {
    updateState((s) => ({
      ...s,
      user: s.user && { ...s.user, displayName: name.trim() || s.user.displayName, country },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "debates-ch-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>

      <Card className="mt-6 p-6">
        <SectionTitle>Profile</SectionTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 outline-none focus:border-brand"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Country {flagFor(country)}</span>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 outline-none focus:border-brand"
            />
          </label>
        </div>
        <button type="button" onClick={save} className={`${buttonClass("primary", "md")} mt-4`}>
          {saved ? "Saved ✓" : "Save changes"}
        </button>
      </Card>

      <Card className="mt-4 p-6">
        <SectionTitle>Appearance</SectionTitle>
        <p className="mt-2 text-sm text-fg-muted">
          Dark is the default; light mode uses the same palette on bright
          surfaces.
        </p>
        <div className="mt-3 flex gap-2" role="group" aria-label="Theme">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={state.theme === t}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold capitalize transition-colors ${
                state.theme === t
                  ? "bg-brand text-white shadow-[0_3px_0_var(--brand-edge)]"
                  : "bg-surface-2 text-fg-muted hover:bg-surface-3"
              }`}
            >
              {t === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <SectionTitle>Account</SectionTitle>
        <p className="mt-2 text-sm text-fg-muted">
          Signed in as <strong className="text-fg">{user.email}</strong>. Your
          progress syncs to your account when a database is connected, so
          logging in on another device restores it.
        </p>
        <button
          type="button"
          onClick={async () => {
            await pushProgress();
            await logOutServer();
            logOut();
            router.push("/");
          }}
          className={`${buttonClass("secondary", "lg")} mt-4 w-full sm:w-auto`}
        >
          Log out
        </button>
      </Card>

      <Card className="mt-4 p-6">
        <SectionTitle>Your debater</SectionTitle>
        <p className="mt-2 text-sm text-fg-muted">
          Change how you look in the debate room.
        </p>
        {editingAvatar ? (
          <div className="mt-4">
            <AvatarBuilder value={avatar} onChange={setAvatar} name={user.displayName} />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  updateState((s) => ({
                    ...s,
                    user: s.user && { ...s.user, avatar },
                  }));
                  setEditingAvatar(false);
                }}
                className={`${buttonClass("primary", "md")} flex-1`}
              >
                Save look
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatar(user.avatar ?? DEFAULT_USER_AVATAR);
                  setEditingAvatar(false);
                }}
                className={buttonClass("secondary", "md")}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingAvatar(true)}
            className={`${buttonClass("secondary", "md")} mt-3`}
          >
            Edit avatar
          </button>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <SectionTitle>Coach</SectionTitle>
        <p className="mt-2 text-sm text-fg-muted">
          {user.coachSlug
            ? "Your coach appears on your player card and offers practice-mode advice."
            : "No coach selected. Any of the 45 bots can coach you."}
        </p>
        <Link href="/coach" className={`${buttonClass("secondary", "md")} mt-3`}>
          {user.coachSlug ? "Change coach" : "Choose a coach"}
        </Link>
      </Card>

      <Card className="mt-4 p-6">
        <SectionTitle>Celebration</SectionTitle>
        <p className="mt-2 text-sm text-fg-muted">
          Played on the results screen when a round is won.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CELEBRATIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                updateState((s) => ({
                  ...s,
                  user: s.user && { ...s.user, celebration: c.id },
                }))
              }
              aria-pressed={(user.celebration ?? "confetti") === c.id}
              className={`rounded-xl px-3 py-3 text-center transition-colors ${
                (user.celebration ?? "confetti") === c.id
                  ? "bg-brand/15 ring-2 ring-brand"
                  : "bg-surface-2 hover:bg-surface-3"
              }`}
            >
              <span className="block text-2xl">{c.emoji}</span>
              <span className="mt-1 block text-xs font-semibold">{c.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <SectionTitle>Motions</SectionTitle>
        <p className="mt-2 text-sm text-fg-muted">
          Rate motions and optionally steer what you get drawn.
        </p>
        <div className="mt-4">
          <MotionDirectory motions={motions} />
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <SectionTitle>Privacy &amp; data</SectionTitle>
        <ul className="mt-3 space-y-2 text-sm text-fg-muted">
          <li>• All data lives in this browser&apos;s local storage — nothing is uploaded in demo mode.</li>
          <li>• Recordings are never used for AI training; hosted builds keep this off by default with an explicit opt-in.</li>
          <li>• A recording indicator is always shown whenever audio or video capture is active.</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={exportData} className={buttonClass("secondary", "md")}>
            Download my data (JSON)
          </button>
          {state.waitlist && (
            <button
              type="button"
              onClick={() => updateState((s) => ({ ...s, waitlist: null }))}
              className={buttonClass("secondary", "md")}
            >
              Leave matchmaking waitlist
            </button>
          )}
        </div>
      </Card>

      <div className="mt-8 text-center text-xs text-fg-faint">
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="underline hover:text-danger"
          >
            Delete account and all data
          </button>
        ) : (
          <span>
            This permanently removes everything on this device.{" "}
            <button
              type="button"
              onClick={() => {
                updateState(() => defaultState());
                router.push("/");
              }}
              className="font-semibold text-danger underline"
            >
              Yes, delete
            </button>{" "}
            ·{" "}
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="underline hover:text-fg"
            >
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <Settings />
    </RequireAuth>
  );
}
