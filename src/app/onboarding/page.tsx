"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { flagFor } from "@/lib/flags-emoji";
import { updateState, useAppState } from "@/lib/store";
import type { AvatarConfig } from "@/components/cartoon-avatar";
import { AvatarBuilder, DEFAULT_USER_AVATAR } from "@/components/avatar-builder";
import { CartoonAvatar } from "@/components/cartoon-avatar";
import RequireAuth from "@/components/require-auth";
import { buttonClass, Card, ProgressBar } from "@/components/ui";

const COUNTRIES = [
  "Switzerland", "Germany", "France", "Italy", "Austria", "United Kingdom",
  "Ireland", "Spain", "Portugal", "Netherlands", "Belgium", "Poland",
  "Czechia", "Sweden", "Norway", "Denmark", "Finland", "Greece", "Turkey",
  "United States", "Canada", "Mexico", "Brazil", "Argentina", "India",
  "Pakistan", "China", "Japan", "South Korea", "Singapore", "Australia",
  "New Zealand", "South Africa", "Nigeria", "Kenya", "Egypt", "Morocco",
  "Russia", "Cyprus", "Other",
];

const TOTAL_STEPS = 3;

function OnboardingWizard() {
  const router = useRouter();
  const { user } = useAppState();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.displayName ?? "");
  const [country, setCountry] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_USER_AVATAR);

  function finish(customAvatar: AvatarConfig | null) {
    updateState((s) => ({
      ...s,
      user: s.user && {
        ...s.user,
        displayName: name.trim() || "Debater",
        country,
        avatar: customAvatar ?? DEFAULT_USER_AVATAR,
      },
    }));
    router.push("/home");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <ProgressBar value={(step + 1) / TOTAL_STEPS} />
      <p className="mt-2 text-xs text-fg-faint">
        Step {step + 1} of {TOTAL_STEPS}
      </p>

      {step === 0 && (
        <Card className="mt-4 p-6">
          <h1 className="text-2xl font-extrabold">What should we call you?</h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            aria-label="Display name"
            autoFocus
            className="mt-4 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="button"
            disabled={name.trim().length < 2}
            onClick={() => setStep(1)}
            className={`${buttonClass("primary", "lg")} mt-4 w-full`}
          >
            Continue
          </button>
        </Card>
      )}

      {step === 1 && (
        <Card className="mt-4 p-6">
          <h1 className="text-2xl font-extrabold">
            Where are you debating from? {flagFor(country)}
          </h1>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Country"
            className="mt-4 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="">Choose a country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!country}
            onClick={() => setStep(2)}
            className={`${buttonClass("primary", "lg")} mt-4 w-full`}
          >
            Continue
          </button>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-4 p-6">
          <h1 className="text-2xl font-extrabold">Make your debater</h1>
          <p className="mt-1 text-sm text-fg-muted">
            This is the face that shows up in the debate room. You can change it
            anytime in Settings.
          </p>
          <div className="mt-4">
            <AvatarBuilder value={avatar} onChange={setAvatar} name={name || "You"} />
          </div>
          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => finish(avatar)}
              className={buttonClass("primary", "lg")}
            >
              Use this look
            </button>
            <button
              type="button"
              onClick={() => finish(null)}
              className={buttonClass("ghost", "md")}
            >
              Skip — give me the default
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

/** Small preview used elsewhere to render the player's chosen avatar. */
export function UserAvatar({
  avatar,
  name,
  size = 64,
  speaking = false,
  className = "",
}: {
  avatar: AvatarConfig | null | undefined;
  name: string;
  size?: number;
  speaking?: boolean;
  className?: string;
}) {
  return (
    <CartoonAvatar
      config={avatar ?? DEFAULT_USER_AVATAR}
      name={name}
      size={size}
      speaking={speaking}
      className={className}
    />
  );
}

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingWizard />
    </RequireAuth>
  );
}
