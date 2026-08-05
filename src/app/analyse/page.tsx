"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { updateState, useAppState, type AnalysisJob } from "@/lib/store";
import { Badge, buttonClass, Card, EmptyState } from "@/components/ui";

const ACCEPTED = [".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a"];
const MAX_MB = 500;

export default function AnalysePage() {
  const router = useRouter();
  const { analyses } = useAppState();
  const [error, setError] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState(2);
  const [language, setLanguage] = useState("English");
  const [consent, setConsent] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED.includes(ext))
      return `Unsupported file type ${ext}. Accepted: ${ACCEPTED.join(", ")}.`;
    if (file.size > MAX_MB * 1024 * 1024)
      return `File is too large (${(file.size / 1024 / 1024).toFixed(0)} MB). The limit is ${MAX_MB} MB.`;
    return null;
  }

  function handleFile(file: File) {
    if (!consent) {
      setError("Please confirm you have consent from everyone in the recording.");
      return;
    }
    const problem = validate(file);
    if (problem) {
      setError(problem);
      return;
    }
    const job: AnalysisJob = {
      id: crypto.randomUUID(),
      fileName: file.name,
      sizeMB: Math.max(0.1, +(file.size / 1024 / 1024).toFixed(1)),
      speakers,
      language,
      stage: 0,
      status: "processing",
      createdAt: Date.now(),
    };
    updateState((s) => ({ ...s, analyses: [job, ...s.analyses].slice(0, 20) }));
    router.push(`/analyse/${job.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Upload &amp; Analyse</h1>
      <p className="mt-2 text-fg-muted">
        Upload a recorded debate and receive a speaker-labelled transcript,
        six-skill scorecards, missed rebuttals and a clear judgement.
      </p>
      <Badge tone="warning" className="mt-3">
        Mock pipeline — processing is simulated locally with a sample result
      </Badge>

      <Card className="mt-6 p-6">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a debate recording"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragOver ? "border-brand bg-brand/10" : "border-border-subtle hover:border-brand/50"
          }`}
        >
          <p className="font-semibold">Drop your recording here</p>
          <p className="mt-1 text-sm text-fg-muted">
            or click to browse · {ACCEPTED.join(" ")} · up to {MAX_MB} MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">Number of speakers</span>
            <select
              value={speakers}
              onChange={(e) => setSpeakers(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 outline-none focus:border-brand"
            >
              {[1, 2, 3, 4, 6, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 outline-none focus:border-brand"
            >
              {["English", "German", "French", "Italian", "Spanish"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex items-start gap-2 text-xs text-fg-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setError(null);
            }}
            className="mt-0.5 accent-[#81b64c]"
          />
          I confirm everyone in this recording consents to it being analysed.
          In demo mode the file never leaves this device; only its name and
          settings are stored, and I can delete the analysis at any time.
        </label>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </Card>

      <h2 className="mt-8 text-lg font-bold">Your analyses</h2>
      {analyses.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Nothing analysed yet"
            body="Upload a recording above — the mocked pipeline walks through every processing stage and produces a sample report."
          />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.fileName}</p>
                <p className="text-xs text-fg-muted">
                  {a.sizeMB} MB · {a.speakers} speakers · {a.language} ·{" "}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge tone={a.status === "ready" ? "brand" : a.status === "failed" ? "danger" : "warning"}>
                {a.status}
              </Badge>
              <Link href={`/analyse/${a.id}`} className={buttonClass("secondary", "sm")}>
                Open
              </Link>
              <button
                type="button"
                aria-label={`Delete analysis of ${a.fileName}`}
                onClick={() =>
                  updateState((s) => ({
                    ...s,
                    analyses: s.analyses.filter((x) => x.id !== a.id),
                  }))
                }
                className={buttonClass("danger", "sm")}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
