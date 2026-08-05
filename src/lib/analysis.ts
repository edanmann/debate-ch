import { SKILL_KEYS, type SkillKey } from "./types";

/** Mock uploaded-debate analysis pipeline (spec §26) — client-safe helpers. */

export const PIPELINE_STAGES = [
  "Uploaded",
  "Extracting audio",
  "Transcribing",
  "Separating speakers",
  "Segmenting debate phases",
  "Analysing arguments",
  "Judging",
  "Generating coaching",
  "Ready",
] as const;

export interface SpeakerReport {
  label: string;
  scores: Record<SkillKey, number>;
  strongest: string;
  improvement: string;
}

export interface SampleAnalysis {
  speakers: SpeakerReport[];
  judgement: string;
  missedRebuttal: string;
  evidenceNote: string;
  fallacyWarning: string;
  deliveryNote: string;
  plan: string[];
  transcriptSample: { at: string; speaker: string; text: string }[];
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic sample report keyed on the job id. Clearly labelled a sample:
 * real transcription/diarisation requires the hosted media pipeline.
 */
export function sampleAnalysis(jobId: string, speakerCount: number): SampleAnalysis {
  const speakers: SpeakerReport[] = Array.from(
    { length: Math.max(1, Math.min(4, speakerCount)) },
    (_, i) => {
      const scores = {} as Record<SkillKey, number>;
      for (const key of SKILL_KEYS) {
        scores[key] = 42 + ((hash(jobId + key + i) % 34));
      }
      return {
        label: `Speaker ${i + 1}`,
        scores,
        strongest:
          i % 2 === 0
            ? "Clear causal chains — claims usually arrived with mechanisms attached."
            : "Direct engagement — consistently answered the previous speaker by name.",
        improvement:
          i % 2 === 0
            ? "Comparative weighing: impacts were stated but rarely compared against the other side's."
            : "Evidence precision: several numeric claims arrived without a source or hedge.",
      };
    }
  );
  const lead = speakers.reduce((a, b) =>
    Object.values(a.scores).reduce((x, y) => x + y, 0) >=
    Object.values(b.scores).reduce((x, y) => x + y, 0)
      ? a
      : b
  );
  return {
    speakers,
    judgement: `${lead.label} takes the round on overall consistency and time use; the margin narrows sharply in the closing exchange.`,
    missedRebuttal:
      "At 07:42 the implementation-cost objection went unanswered and resurfaced in the closing unchallenged.",
    evidenceNote:
      "Strongest evidence use: the comparative statistic at 04:15, correctly hedged and tied to the motion.",
    fallacyWarning:
      "One likely false dilemma at 09:03 (\"either we act now or never\") — flag, verify, and answer the middle options.",
    deliveryNote:
      "Pace climbed noticeably under time pressure after 11:00; the strongest lines were delivered too fast to land.",
    plan: [
      "Drill comparative weighing: end each argument with one sentence on why it outweighs.",
      "Practise the 'answer their best point first' rebuttal order.",
      "Record one two-minute speech and re-listen only for pace at key lines.",
    ],
    transcriptSample: [
      { at: "00:12", speaker: "Speaker 1", text: "The motion asks a simple question with an expensive answer…" },
      { at: "02:30", speaker: "Speaker 2", text: "My opponent's mechanism assumes compliance that their own evidence undermines…" },
      { at: "04:15", speaker: "Speaker 1", text: "Roughly a third of comparable programmes met their targets — imperfect, but decisive compared to the alternative…" },
      { at: "09:03", speaker: "Speaker 2", text: "Either we act now, or we accept this never changes…" },
    ],
  };
}
