import type { Metadata } from "next";

export const metadata: Metadata = { title: "Safety" };

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Safety at Debates.ch</h1>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Debate the argument, never the person</h2>
        <p className="mt-2 leading-relaxed text-fg-muted">
          Aggression belongs to arguments, not people. Harassment, threats,
          slurs, doxxing and protected-class abuse end rounds and accounts.
          Every debate has a report control, and blocking is silent and mutual.
        </p>
      </section>

      <section className="mt-6" id="simulations">
        <h2 className="text-xl font-bold">Public-figure simulations</h2>
        <p className="mt-2 leading-relaxed text-fg-muted">
          Some bots are inspired by real public figures. Every one of them is an
          AI-generated debate simulation: it is not the real person, it is not
          endorsed by them, and nothing it says is an authentic quotation,
          belief or current position. These bots use original stylised artwork —
          never photorealistic likenesses or cloned voices — and follow strict
          rules: no fabricated sources or quotes, no claimed personal memories,
          no private information, and prompt correction of verified factual
          errors. One roster concept was excluded entirely on these grounds.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Honest AI</h2>
        <p className="mt-2 leading-relaxed text-fg-muted">
          Bots must distinguish fact from estimate from inference, admit
          uncertainty, and never invent citations — at any difficulty.
          Difficulty raises debating skill, never dishonesty. The AI judge
          labels every result an educational assessment and shows its
          reasoning; it is a training tool, not an oracle.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold">High-stakes topics</h2>
        <p className="mt-2 leading-relaxed text-fg-muted">
          Motions touching medical, legal, financial or safety territory carry
          stronger sourcing requirements and clear warnings, and nothing on
          this platform is professional advice. Sensitive motions are excluded
          from random rated draws. The system may refuse unsafe framings
          outright.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Protecting younger debaters</h2>
        <p className="mt-2 leading-relaxed text-fg-muted">
          Motions carry age-suitability ratings, moderation applies to all
          content in both directions, and privacy defaults are the strictest
          setting for everyone.
        </p>
      </section>
    </div>
  );
}
