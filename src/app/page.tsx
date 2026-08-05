import { getBotCards } from "@/lib/bots";
import { BotCard } from "@/components/bot-card";
import HeroLiveMock from "@/components/landing/hero-live-mock";
import AppPhoneMock from "@/components/landing/app-phone-mock";
import WatchLiveMock from "@/components/landing/watch-live-mock";
import { Mascot } from "@/components/landing/mascot";
import { Badge, ButtonLink } from "@/components/ui";
import PuzzlePreview from "@/components/landing/puzzle-preview";
import RedirectIfAuthed from "@/components/landing/redirect-if-authed";

/** Public landing page — original composition covering the eight source sections. */

const SHOWCASE_SLUGS = [
  "donald-trump",
  "cristiano-ronaldo",
  "elon-musk",
  "barack-obama",
  "mrbeast",
  "mehdi-hasan",
];

function Section({
  id,
  eyebrow,
  title,
  sub,
  cta,
  ctaHref,
  children,
  flip = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  ctaHref: string;
  children: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      {/* min-w-0 lets grid children shrink below their intrinsic width, which
          is what stops wide demo panels forcing horizontal scroll on phones. */}
      <div
        className={`grid items-center gap-10 lg:grid-cols-2 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}
      >
        <div className="min-w-0">
          <Badge tone="brand">{eyebrow}</Badge>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-lg text-fg-muted">{sub}</p>
          <ButtonLink href={ctaHref} size="lg" className="mt-6">
            {cta}
          </ButtonLink>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const showcase = getBotCards().filter((b) => SHOWCASE_SLUGS.includes(b.slug));

  return (
    <div>
      <RedirectIfAuthed />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(129,182,76,0.12),transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:gap-12 sm:pt-20 lg:grid-cols-2">
          <div className="min-w-0">
            <h1 className="text-[2rem] font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Debate anyone.
              <br />
              <span className="text-brand">Improve every round.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-fg-muted sm:mt-5 sm:text-lg">
              Debate people or distinctive AI opponents, receive clear analysis
              and sharpen the skills that make arguments matter.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/signup" size="xl" className="w-full sm:w-auto">
                Start Debating
              </ButtonLink>
              <ButtonLink
                href="/bots"
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto"
              >
                Challenge a Bot
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-fg-faint">
              Free to start. No credit card. 45 opponents waiting right now.
            </p>
          </div>
          <div className="min-w-0">
            <HeroLiveMock />
          </div>
        </div>
      </section>

      {/* Lessons */}
      <Section
        id="lessons"
        eyebrow="Coming soon"
        title="Interactive debate lessons"
        sub="Fully interactive lessons for argumentation, rebuttal, evidence, strategy, delivery and persuasion are in the workshop. Until they're genuinely interactive, they stay off the menu — train with puzzles meanwhile."
        cta="Solve a Puzzle instead"
        ctaHref="/puzzles"
        flip
      >
        <div className="relative pt-14">
          <Mascot
            slug="donald-trump"
            name="Trump"
            quote="Nobody debates better than me. Nobody!"
            side="right"
            size={112}
          />
          <div className="grid gap-3 rounded-3xl bg-board p-4 shadow-2xl ring-1 ring-black/10">
            {[
              ["Anatomy of an Argument", "Argumentation"],
              ["Rebuttal That Actually Lands", "Rebuttal"],
              ["Weighing: Why Yours Matters More", "Strategy"],
            ].map(([title, meta]) => (
              <div
                key={title}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-ink shadow-sm"
              >
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="text-xs text-ink-muted">{meta}</p>
                </div>
                <span className="rounded-full bg-board-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-ink-muted">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Bots */}
      <section id="bots" className="border-y border-border-subtle bg-surface-1/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="brand">Practise anytime</Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Debate distinctive AI opponents
            </h2>
            <p className="mt-3 text-fg-muted">
              Choose from beginner to master, each with different strengths,
              weaknesses and debate behaviour.
            </p>
          </div>
          <div className="mt-10 rounded-3xl bg-board p-4 shadow-2xl ring-1 ring-black/10 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((bot) => (
                <BotCard key={bot.slug} bot={bot} />
              ))}
            </div>
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/bots" size="lg">
              Challenge a Bot
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Puzzles */}
      <Section
        id="puzzles"
        eyebrow="Daily training"
        title="Level up with debate puzzles"
        sub="Train rebuttal, framing, evidence and strategic judgement through short daily challenges. Try today's:"
        cta="Solve a Puzzle"
        ctaHref="/puzzles"
      >
        <PuzzlePreview />
      </Section>

      {/* Watch */}
      <Section
        id="watch"
        eyebrow="Spectate"
        title="Watch debates with real-time analysis"
        sub="Follow live, upcoming and previous debates with transcripts, argument maps and judge commentary."
        cta="Watch Debates"
        ctaHref="/watch"
        flip
      >
        <WatchLiveMock />
      </Section>

      {/* Upload & analyse */}
      <Section
        id="analyse"
        eyebrow="Your own rounds"
        title="Upload and analyse any debate"
        sub="Receive timestamped feedback, score breakdowns, missed rebuttals and a clear judgement for debates you've already had — audio or video."
        cta="Analyse a Debate"
        ctaHref="/analyse"
      >
        <div className="rounded-3xl bg-board p-5 text-ink shadow-2xl ring-1 ring-black/10" aria-hidden>
          <div className="rounded-2xl border-2 border-dashed border-[#c9c7bd] bg-white/60 p-6 text-center text-sm font-bold text-ink-muted">
            Drop MP4, MOV, WebM, MP3, WAV or M4A
          </div>
          <div className="mt-3 space-y-2">
            {[
              "Speaker-labelled transcript",
              "Six-skill scorecard per speaker",
              "Missed rebuttals with timestamps",
              "A clear, explained judgement",
            ].map((line) => (
              <p
                key={line}
                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold shadow-sm"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#81b64c] text-[9px] text-white">
                  ✓
                </span>
                {line}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {/* Mobile app */}
      <section className="border-y border-border-subtle bg-surface-1/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <Badge tone="brand">On the go</Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Debate anywhere with the Debates.ch app
            </h2>
            <p className="mt-3 max-w-lg text-fg-muted">
              Audio debates with animated opponents, one thumb on the timer.
              The mobile app is on its way.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="cursor-not-allowed rounded-xl border border-border-subtle px-5 py-3 text-sm text-fg-faint">
                 App Store — coming soon
              </span>
              <span className="cursor-not-allowed rounded-xl border border-border-subtle px-5 py-3 text-sm text-fg-faint">
                ▶ Google Play — coming soon
              </span>
            </div>
          </div>
          <AppPhoneMock />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
          Learn, debate and have fun.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">
          Join to keep your rating, unlock every bot, and turn every round into
          measurable progress.
        </p>
        <ButtonLink href="/signup" size="xl" className="mt-8">
          Get Started
        </ButtonLink>
      </section>
    </div>
  );
}
