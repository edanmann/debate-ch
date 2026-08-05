import type { FormatConfig, PhaseConfig } from "./types";

/**
 * Generic phase-based timer engine (spec §12, §18.4).
 * Pure functions over immutable state so the debate room can persist and
 * restore exactly, and so behaviour is unit-testable without React.
 */

export interface EngineState {
  phaseIndex: number;
  remainingSec: number;
  finished: boolean;
}

export type TimerEventType =
  | "warning-30"
  | "warning-10"
  | "warning-3"
  | "phase-ended"
  | "debate-ended";

export interface TimerEvent {
  type: TimerEventType;
  phaseId: string;
}

export function initEngine(format: FormatConfig): EngineState {
  const first = format.phases[0];
  return {
    phaseIndex: 0,
    remainingSec: first ? first.durationSec : 0,
    finished: format.phases.length === 0,
  };
}

export function currentPhase(
  format: FormatConfig,
  state: EngineState
): PhaseConfig | null {
  if (state.finished) return null;
  return format.phases[state.phaseIndex] ?? null;
}

function enterPhase(format: FormatConfig, index: number): EngineState {
  if (index >= format.phases.length) {
    return { phaseIndex: index, remainingSec: 0, finished: true };
  }
  return {
    phaseIndex: index,
    remainingSec: format.phases[index].durationSec,
    finished: false,
  };
}

/** Advance one second. Emits threshold warnings and phase transitions. */
export function tickEngine(
  format: FormatConfig,
  state: EngineState
): { state: EngineState; events: TimerEvent[] } {
  if (state.finished) return { state, events: [] };
  const phase = format.phases[state.phaseIndex];
  const events: TimerEvent[] = [];
  const remaining = state.remainingSec - 1;

  // Only warn when the phase is long enough for the warning to mean something.
  if (remaining === 30 && phase.durationSec > 45)
    events.push({ type: "warning-30", phaseId: phase.id });
  if (remaining === 10 && phase.durationSec > 20)
    events.push({ type: "warning-10", phaseId: phase.id });
  if (remaining === 3) events.push({ type: "warning-3", phaseId: phase.id });

  if (remaining <= 0) {
    events.push({ type: "phase-ended", phaseId: phase.id });
    const next = enterPhase(format, state.phaseIndex + 1);
    if (next.finished) events.push({ type: "debate-ended", phaseId: phase.id });
    return { state: next, events };
  }
  return { state: { ...state, remainingSec: remaining, finished: false }, events };
}

/** End the current phase early (speaker finished before time). */
export function endPhaseEarly(
  format: FormatConfig,
  state: EngineState
): { state: EngineState; events: TimerEvent[] } {
  if (state.finished) return { state, events: [] };
  const phase = format.phases[state.phaseIndex];
  const events: TimerEvent[] = [{ type: "phase-ended", phaseId: phase.id }];
  const next = enterPhase(format, state.phaseIndex + 1);
  if (next.finished) events.push({ type: "debate-ended", phaseId: phase.id });
  return { state: next, events };
}

export function totalDurationSec(format: FormatConfig): number {
  return format.phases.reduce((acc, p) => acc + p.durationSec, 0);
}

/** 0..1 progress across the whole round, for the phase progress bar. */
export function overallProgress(
  format: FormatConfig,
  state: EngineState
): number {
  const total = totalDurationSec(format);
  if (total === 0 || state.finished) return 1;
  let elapsed = 0;
  for (let i = 0; i < state.phaseIndex; i++) {
    elapsed += format.phases[i].durationSec;
  }
  elapsed += format.phases[state.phaseIndex].durationSec - state.remainingSec;
  return Math.min(1, elapsed / total);
}
