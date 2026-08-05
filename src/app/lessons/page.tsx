import type { Metadata } from "next";
import { LearnColor } from "@/components/color-icons";
import { Badge, ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "Lessons" };

const TRACKS = [
  "Foundations",
  "Argumentation",
  "Rebuttal",
  "Evidence",
  "Strategy",
  "Delivery",
  "Persuasion",
  "Cross-examination",
  "British Parliamentary",
  "Public speaking",
  "Professional communication",
];

/**
 * Lessons are gated to "coming soon" until they are genuinely interactive
 * (product decision 2026-07-31: interactive or nothing, no middle ground).
 */
export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <LearnColor className="mx-auto h-16 w-16" />
      <Badge tone="warning" className="mt-4">Coming soon</Badge>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        Lessons are being rebuilt — properly
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-fg-muted">
        Quiz cards weren&apos;t good enough. The new lessons will be fully
        interactive — you&apos;ll argue, get interrupted, rebuild and rebut
        inside the lesson itself. Until they meet that bar, they stay off the
        menu.
      </p>
      <div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2">
        {TRACKS.map((t) => (
          <span
            key={t}
            className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg-muted"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/puzzles" size="lg">
          Train with puzzles instead
        </ButtonLink>
        <ButtonLink href="/bots" size="lg" variant="secondary">
          Or just debate
        </ButtonLink>
      </div>
    </div>
  );
}
