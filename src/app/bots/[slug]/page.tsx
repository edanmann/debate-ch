import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBotBySlug, getVisibleBots, toCardData } from "@/lib/bots";
import { SKILL_KEYS, SKILL_LABELS } from "@/lib/types";
import { BotFace } from "@/components/bot-face";
import { SixStatBars, StatRadar } from "@/components/stats";
import { Badge, Card, SectionTitle } from "@/components/ui";
import BotActions from "./actions-client";

export function generateStaticParams() {
  return getVisibleBots().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const bot = getBotBySlug((await params).slug);
  return { title: bot ? `${bot.name} — Bot Profile` : "Bot not found" };
}

function KV({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <dl className="grid gap-2 text-sm">
      {entries.map(([k, v]) => (
        <div key={k}>
          <dt className="font-semibold text-fg-muted">{k}</dt>
          <dd className="text-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function BotProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const bot = getBotBySlug((await params).slug);
  if (!bot) notFound();

  const card = toCardData(bot);
  const traits = Object.entries(bot.personality.traits);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <BotFace slug={bot.slug} name={bot.name} size={120} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">{bot.name}</h1>
            {bot.overallRating != null && (
              <span className="numeric rounded-xl bg-surface-2 px-3 py-1 text-xl font-black text-brand">
                {bot.overallRating}
              </span>
            )}
          </div>
          <p className="mt-1 text-fg-muted">
            {bot.archetype} · {bot.category.replace(" - Planned", "")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {bot.status === "planned" && <Badge tone="warning">Coming later</Badge>}
          </div>
          <p className="mt-3 max-w-2xl">{bot.oneLineSummary}</p>
        </div>
        <div className="w-full md:w-72">
          <BotActions slug={bot.slug} name={bot.name} playable={bot.status === "active"} />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Stats */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Public statistics</SectionTitle>
          <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
            {card.stats && <StatRadar stats={card.stats} />}
            <div className="w-full flex-1">
              {card.stats && <SixStatBars stats={card.stats} />}
            </div>
          </div>
          <dl className="mt-5 grid gap-3 border-t border-border-subtle pt-4 sm:grid-cols-2">
            {SKILL_KEYS.map((key) => {
              const stat = bot.publicStats[key];
              if (!stat) return null;
              return (
                <div key={key} className="text-sm">
                  <dt className="font-semibold">
                    {SKILL_LABELS[key]}{" "}
                    <span className="numeric text-fg-muted">{stat.rating}</span>
                  </dt>
                  <dd className="text-fg-muted">{stat.explanation}</dd>
                </div>
              );
            })}
          </dl>
        </Card>

        {/* Personality */}
        <Card className="p-5">
          <SectionTitle>Personality</SectionTitle>
          {bot.personality.summary && (
            <p className="mt-2 text-sm text-fg-muted">{bot.personality.summary}</p>
          )}
          <ul className="mt-4 space-y-2">
            {traits.map(([key, t]) => (
              <li key={key} className="flex items-center justify-between gap-2 text-sm">
                <span className="capitalize text-fg-muted">{key.replace(/_/g, " ")}</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-3">
                    <span
                      className="block h-full rounded-full bg-brand-deep"
                      style={{ width: `${t.rating ?? 0}%` }}
                    />
                  </span>
                  <span className="numeric w-7 text-right font-semibold">{t.rating ?? "–"}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Signature traits / weaknesses */}
        <Card className="p-5">
          <SectionTitle>Signature traits</SectionTitle>
          <ul className="mt-3 space-y-3 text-sm">
            {bot.signatureTraits.map((t) => (
              <li key={t.title}>
                <p className="font-semibold">{t.title}</p>
                {t.description && <p className="text-fg-muted">{t.description}</p>}
              </li>
            ))}
          </ul>
          <SectionTitle className="mt-6">Clear weaknesses</SectionTitle>
          <ul className="mt-3 space-y-3 text-sm">
            {bot.weaknesses.map((w) => (
              <li key={w.title}>
                <p className="font-semibold text-warning">{w.title}</p>
                {w.description && <p className="text-fg-muted">{w.description}</p>}
              </li>
            ))}
          </ul>
        </Card>

        {/* Debate style */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Debate style</SectionTitle>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-fg-faint">
                Communication
              </h3>
              <div className="mt-2"><KV data={bot.communicationStyle} /></div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-fg-faint">
                Argumentation
              </h3>
              <div className="mt-2"><KV data={bot.argumentationStyle} /></div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-fg-faint">
                Rebuttal
              </h3>
              <div className="mt-2"><KV data={bot.rebuttalStyle} /></div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-fg-faint">
                Evidence
              </h3>
              <div className="mt-2"><KV data={bot.evidenceBehaviour} /></div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-fg-faint">
                Strategy
              </h3>
              <div className="mt-2"><KV data={bot.strategicBehaviour} /></div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-fg-faint">
                Delivery &amp; persuasion
              </h3>
              <div className="mt-2">
                <KV data={{ ...bot.deliveryStyle, ...bot.persuasionStyle }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Stage & conditional behaviour */}
        <Card className="p-5">
          <SectionTitle>Round behaviour</SectionTitle>
          <div className="mt-2"><KV data={bot.debateStageBehaviour} /></div>
          <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-fg-faint">
            Under pressure
          </h3>
          <div className="mt-2"><KV data={bot.conditionalBehaviour} /></div>
        </Card>

        {/* Topics */}
        <Card className="p-5">
          <SectionTitle>Topic strengths</SectionTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {bot.topicStrengths.map((t) => (
              <li key={t.topic}>
                <p className="font-semibold">
                  {t.topic} <span className="numeric text-brand">{t.rating ?? ""}</span>
                </p>
                {t.explanation && <p className="text-fg-muted">{t.explanation}</p>}
              </li>
            ))}
          </ul>
          <SectionTitle className="mt-6">Topic weaknesses</SectionTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {bot.topicWeaknesses.map((t) => (
              <li key={t.topic}>
                <p className="font-semibold">
                  {t.topic} <span className="numeric text-warning">{t.rating ?? ""}</span>
                </p>
                {t.explanation && <p className="text-fg-muted">{t.explanation}</p>}
              </li>
            ))}
          </ul>
        </Card>

        {/* Sayings */}
        <Card className="p-5">
          <SectionTitle>Signature sayings</SectionTitle>
          <ul className="mt-3 space-y-3 text-sm">
            {bot.humorousStatements.map((s) => (
              <li key={s.text}>
                <p className="italic">“{s.text}”</p>
                {s.usage && <p className="mt-0.5 text-xs text-fg-faint">{s.usage}</p>}
              </li>
            ))}
          </ul>
        </Card>

        {/* Defeat guide */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>How to defeat this bot</SectionTitle>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            {bot.defeatGuide.bestStrategy && (
              <div>
                <dt className="font-semibold text-brand">Best strategy</dt>
                <dd className="text-fg-muted">{bot.defeatGuide.bestStrategy}</dd>
              </div>
            )}
            {bot.defeatGuide.whatToAvoid && (
              <div>
                <dt className="font-semibold text-danger">What to avoid</dt>
                <dd className="text-fg-muted">{bot.defeatGuide.whatToAvoid}</dd>
              </div>
            )}
            {bot.defeatGuide.bestQuestioningMethod && (
              <div>
                <dt className="font-semibold">Best questioning method</dt>
                <dd className="text-fg-muted">{bot.defeatGuide.bestQuestioningMethod}</dd>
              </div>
            )}
            {bot.defeatGuide.mostVulnerableStatistic && (
              <div>
                <dt className="font-semibold">Most vulnerable statistic</dt>
                <dd className="text-fg-muted">{bot.defeatGuide.mostVulnerableStatistic}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Example responses */}
        {bot.examples.opening && (
          <Card className="p-5 lg:col-span-3">
            <SectionTitle>Example responses</SectionTitle>
            {bot.examples.motion && (
              <p className="mt-2 text-sm text-fg-muted">
                Motion: {bot.examples.motion}
              </p>
            )}
            <dl className="mt-3 grid gap-4 text-sm md:grid-cols-2">
              {(
                [
                  ["Opening", bot.examples.opening],
                  ["Rebuttal", bot.examples.rebuttal],
                  ["Cross-examination", bot.examples.crossExamQuestion],
                  ["Closing", bot.examples.closing],
                ] as const
              ).map(([label, text]) =>
                text ? (
                  <div key={label} className="rounded-xl bg-surface-2 p-3">
                    <dt className="font-semibold">{label}</dt>
                    <dd className="mt-1 text-fg-muted">{text}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </Card>
        )}
      </div>

      {bot.publicDisclaimer && (
        <p className="mt-8 rounded-2xl border border-border-subtle bg-surface-1 p-4 text-xs text-fg-faint">
          {bot.publicDisclaimer}
        </p>
      )}
    </div>
  );
}
