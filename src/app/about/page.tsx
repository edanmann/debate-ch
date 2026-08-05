import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">About Debates.ch</h1>
      <div className="mt-4 space-y-4 leading-relaxed text-fg-muted">
        <p>
          Debates.ch is built on a simple belief: arguing well is a learnable
          skill, and the world gets better when more people can do it.
        </p>
        <p>
          We give you opponents who are always awake, judges who explain their
          decisions, lessons that take minutes, and a rating that tells you
          honestly where you stand — six skills, tracked independently:
          argumentation, rebuttal, evidence, strategy, delivery and persuasion.
        </p>
        <p>
          Our opponents have designed strengths and deliberate weaknesses —
          beat them by finding the gaps, not by out-shouting them.
        </p>
        <p>
          Competitive, but not toxic. Educational, but not school software.
          Debate anyone. Improve every round.
        </p>
      </div>
      <ButtonLink href="/signup" size="lg" className="mt-8">
        Join Debates.ch
      </ButtonLink>
    </div>
  );
}
