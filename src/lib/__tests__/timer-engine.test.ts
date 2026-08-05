import { describe, expect, it } from "vitest";
import { FORMATS, getFormat } from "../formats";
import {
  currentPhase,
  endPhaseEarly,
  initEngine,
  overallProgress,
  tickEngine,
  totalDurationSec,
} from "../timer-engine";

const rapid = getFormat("rapid")!;

describe("timer engine", () => {
  it("initialises on the first phase with its full duration", () => {
    const s = initEngine(rapid);
    expect(s.phaseIndex).toBe(0);
    expect(s.remainingSec).toBe(rapid.phases[0].durationSec);
    expect(s.finished).toBe(false);
    expect(currentPhase(rapid, s)?.id).toBe("prep");
  });

  it("counts down by one second per tick", () => {
    const s0 = initEngine(rapid);
    const { state: s1, events } = tickEngine(rapid, s0);
    expect(s1.remainingSec).toBe(s0.remainingSec - 1);
    expect(events).toHaveLength(0);
  });

  it("emits warnings exactly at 30, 10 and 3 seconds", () => {
    let s = { phaseIndex: 0, remainingSec: 31, finished: false };
    let r = tickEngine(rapid, s);
    expect(r.events.map((e) => e.type)).toContain("warning-30");
    s = { phaseIndex: 0, remainingSec: 11, finished: false };
    r = tickEngine(rapid, s);
    expect(r.events.map((e) => e.type)).toContain("warning-10");
    s = { phaseIndex: 0, remainingSec: 4, finished: false };
    r = tickEngine(rapid, s);
    expect(r.events.map((e) => e.type)).toContain("warning-3");
  });

  it("suppresses the 30s warning for very short phases", () => {
    const bullet = getFormat("bullet")!;
    // closing phases are 15s; a 30s-warning would be nonsense
    const s = { phaseIndex: 3, remainingSec: 31, finished: false };
    // remaining can't exceed duration in practice, but the guard is on duration
    const r = tickEngine(bullet, s);
    expect(r.events.map((e) => e.type)).not.toContain("warning-30");
  });

  it("advances to the next phase when time expires", () => {
    const s = { phaseIndex: 0, remainingSec: 1, finished: false };
    const { state, events } = tickEngine(rapid, s);
    expect(events.map((e) => e.type)).toContain("phase-ended");
    expect(state.phaseIndex).toBe(1);
    expect(state.remainingSec).toBe(rapid.phases[1].durationSec);
  });

  it("finishes the debate after the last phase", () => {
    const last = rapid.phases.length - 1;
    const s = { phaseIndex: last, remainingSec: 1, finished: false };
    const { state, events } = tickEngine(rapid, s);
    expect(state.finished).toBe(true);
    expect(events.map((e) => e.type)).toContain("debate-ended");
  });

  it("supports ending a phase early", () => {
    const s = initEngine(rapid);
    const { state } = endPhaseEarly(rapid, s);
    expect(state.phaseIndex).toBe(1);
  });

  it("reports monotonic overall progress", () => {
    const s0 = initEngine(rapid);
    const p0 = overallProgress(rapid, s0);
    const { state: s1 } = endPhaseEarly(rapid, s0);
    const p1 = overallProgress(rapid, s1);
    expect(p1).toBeGreaterThan(p0);
    expect(overallProgress(rapid, { phaseIndex: 99, remainingSec: 0, finished: true })).toBe(1);
  });

  it("has format totals matching the advertised approximations", () => {
    const totals = Object.fromEntries(
      FORMATS.map((f) => [f.id, totalDurationSec(f)])
    );
    expect(totals.bullet).toBe(120);
    expect(totals.blitz).toBe(270);
    expect(totals.rapid).toBe(600);
    expect(totals.classic).toBe(2580);
    expect(totals.marathon).toBe(3420);
  });
});
