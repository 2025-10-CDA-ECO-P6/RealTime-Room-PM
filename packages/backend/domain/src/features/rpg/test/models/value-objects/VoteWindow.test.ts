import { describe, expect, it } from "vitest";
import { VoteWindow } from "../../../models/value-objects";

describe("VoteWindow", () => {
  const startedAt = new Date("2026-01-01T10:00:00.000Z");
  const decisionDeadlineAt = new Date("2026-01-01T10:00:30.000Z");

  it("creates a valid vote window", () => {
    const voteWindow = new VoteWindow(startedAt, decisionDeadlineAt, null);

    expect(voteWindow.startedAt).toEqual(startedAt);
    expect(voteWindow.decisionDeadlineAt).toEqual(decisionDeadlineAt);
    expect(voteWindow.finalizationDeadlineAt).toBeNull();
  });

  it("throws when decision deadline is not after start time", () => {
    expect(() => new VoteWindow(startedAt, startedAt, null)).toThrow("Decision deadline must be after start time");
  });

  it("throws when finalization deadline is before start time", () => {
    expect(() => new VoteWindow(startedAt, decisionDeadlineAt, new Date("2026-01-01T09:59:59.000Z"))).toThrow(
      "Finalization deadline cannot be before start time",
    );
  });

  it("creates a new instance with updated finalization deadline", () => {
    const initial = new VoteWindow(startedAt, decisionDeadlineAt, null);
    const finalizationDeadlineAt = new Date("2026-01-01T10:00:05.000Z");

    const updated = initial.withFinalizationDeadline(finalizationDeadlineAt);

    expect(updated.finalizationDeadlineAt).toEqual(finalizationDeadlineAt);
    expect(initial.finalizationDeadlineAt).toBeNull();
  });

  it("detects decision timeout", () => {
    const voteWindow = new VoteWindow(startedAt, decisionDeadlineAt, null);

    expect(voteWindow.isDecisionExpired(new Date("2026-01-01T10:00:29.999Z"))).toBe(false);
    expect(voteWindow.isDecisionExpired(new Date("2026-01-01T10:00:30.000Z"))).toBe(true);
  });

  it("detects finalization timeout", () => {
    const finalizationDeadlineAt = new Date("2026-01-01T10:00:05.000Z");
    const voteWindow = new VoteWindow(startedAt, decisionDeadlineAt, finalizationDeadlineAt);

    expect(voteWindow.isFinalizationExpired(new Date("2026-01-01T10:00:04.999Z"))).toBe(false);
    expect(voteWindow.isFinalizationExpired(new Date("2026-01-01T10:00:05.000Z"))).toBe(true);
  });

  it("returns false when there is no finalization deadline", () => {
    const voteWindow = new VoteWindow(startedAt, decisionDeadlineAt, null);

    expect(voteWindow.isFinalizationExpired(new Date("2026-01-01T10:00:10.000Z"))).toBe(false);
  });
});
