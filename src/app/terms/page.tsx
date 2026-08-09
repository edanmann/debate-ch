import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-fg-faint">
        Draft terms for the Debates.ch prototype. A jurisdiction-reviewed version
        is required before commercial launch.
      </p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-fg-muted">
        <section>
          <h2 className="font-bold text-fg">1. The service</h2>
          <p>
            Debates.ch provides debate practice against debate bots, which are AI
            systems, plus AI-assisted
            judging, lessons, puzzles and analysis tools. AI output is generated
            content that can be wrong; it is provided for education and
            entertainment, not professional advice.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-fg">2. Your conduct</h2>
          <p>
            You agree not to harass other users, attempt to extract other
            people&apos;s private data, misrepresent AI simulations as real
            people, or use the platform to produce abusive or unlawful content.
            We may suspend accounts that break these rules.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-fg">3. Your content</h2>
          <p>
            You own the speeches, notes and recordings you create. You grant us
            the licence needed to operate the service (storing, transcribing and
            analysing your content at your request). We do not use your content
            to train AI models without explicit opt-in.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-fg">4. Simulated personalities</h2>
          <p>
            Bots inspired by public figures are transformative, stylised
            simulations for education and entertainment, clearly labelled as
            such, and are not sponsored by or affiliated with the individuals.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-fg">5. Ratings</h2>
          <p>
            Skill ratings are in-app estimates for matchmaking and progress
            tracking. They measure in-game performance only and carry no claim
            about intelligence or ability outside the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
