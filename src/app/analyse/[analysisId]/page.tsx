"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { PIPELINE_STAGES, sampleAnalysis } from "@/lib/analysis";
import { updateState, useAppState } from "@/lib/store";
import { SixStatBars } from "@/components/stats";
import { Badge, buttonClass, Card, EmptyState, SectionTitle } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export default function AnalysisResultPage() {
  const params = useParams<{ analysisId: string }>();
  const { analyses } = useAppState();
  const job = analyses.find((a) => a.id === params.analysisId);

  // Advance the mocked pipeline one stage at a time.
  useEffect(() => {
    if (!job || job.status !== "processing") return;
    const id = setTimeout(() => {
      updateState((s) => ({
        ...s,
        analyses: s.analyses.map((a) => {
          if (a.id !== job.id) return a;
          const nextStage = a.stage + 1;
          return {
            ...a,
            stage: nextStage,
            status: nextStage >= PIPELINE_STAGES.length - 1 ? "ready" : "processing",
          };
        }),
      }));
    }, 1100);
    return () => clearTimeout(id);
  }, [job]);

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Analysis not found"
          body="This analysis doesn't exist on this device — it may have been deleted."
          action={<Link href="/analyse" className={buttonClass("primary", "md")}>Upload a debate</Link>}
        />
      </div>
    );
  }

  if (job.status === "processing") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight">Analysing {job.fileName}</h1>
        <Badge tone="warning" className="mt-2">Mock pipeline — simulated stages</Badge>
        <Card className="mt-6 p-6">
          <ol className="space-y-3">
            {PIPELINE_STAGES.map((stage, i) => (
              <li key={stage} className="flex items-center gap-3 text-sm">
                {i < job.stage ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-brand" />
                ) : i === job.stage ? (
                  <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-warning" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-border-subtle" />
                )}
                <span className={i <= job.stage ? "" : "text-fg-faint"}>{stage}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    );
  }

  const report = sampleAnalysis(job.id, job.speakers);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">Ready</Badge>
        <Badge tone="warning">Sample report — mock pipeline</Badge>
      </div>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{job.fileName}</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {job.speakers} speakers · {job.language} · The hosted pipeline will
        transcribe your actual audio; this sample shows the full report shape.
      </p>

      <Card className="mt-6 border-brand/40 p-5">
        <SectionTitle>Judgement</SectionTitle>
        <p className="mt-2 text-sm text-fg-muted">{report.judgement}</p>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {report.speakers.map((s) => (
          <Card key={s.label} className="p-5">
            <SectionTitle>{s.label}</SectionTitle>
            <div className="mt-3">
              <SixStatBars stats={s.scores} compact />
            </div>
            <p className="mt-3 text-sm"><strong>Strongest:</strong> <span className="text-fg-muted">{s.strongest}</span></p>
            <p className="mt-1 text-sm"><strong>Improve:</strong> <span className="text-fg-muted">{s.improvement}</span></p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(
          [
            ["Missed rebuttal", report.missedRebuttal],
            ["Evidence", report.evidenceNote],
            ["Fallacy warning", report.fallacyWarning],
            ["Delivery", report.deliveryNote],
          ] as const
        ).map(([label, text]) => (
          <Card key={label} className="p-4 text-sm">
            <p className="font-semibold">{label}</p>
            <p className="mt-1 text-fg-muted">{text}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-5">
        <SectionTitle>Timestamped transcript (sample)</SectionTitle>
        <div className="mt-3 space-y-2">
          {report.transcriptSample.map((t) => (
            <p key={t.at} className="text-sm">
              <span className="numeric font-semibold text-fg-muted">{t.at}</span>{" "}
              <span className="font-semibold">{t.speaker}:</span>{" "}
              <span className="text-fg-muted">{t.text}</span>
            </p>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <SectionTitle>Improvement plan</SectionTitle>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-fg-muted">
          {report.plan.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </Card>

      <div className="mt-6 flex justify-between">
        <Link href="/analyse" className={buttonClass("ghost", "md")}>← All analyses</Link>
        <button
          type="button"
          className={buttonClass("danger", "md")}
          onClick={() => {
            updateState((s) => ({
              ...s,
              analyses: s.analyses.filter((a) => a.id !== job.id),
            }));
            window.location.href = "/analyse";
          }}
        >
          Delete analysis
        </button>
      </div>
    </div>
  );
}
