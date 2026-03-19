import { describe, expect, it } from "vitest";
import { TurnResolution } from "../../../models/entities";
import { ActionId } from "../../../models/value-objects";

describe("TurnResolution", () => {
  it("creates a resolution with a selected action", () => {
    const resolvedAt = new Date("2026-01-01T10:00:30.000Z");

    const resolution = TurnResolution.create({
      selectedActionId: ActionId.create("attack"),
      reason: "absolute-majority",
      isTie: false,
      resolvedAt,
    });

    expect(resolution.selectedActionId?.value).toBe("attack");
    expect(resolution.reason).toBe("absolute-majority");
    expect(resolution.isTie).toBe(false);
    expect(resolution.resolvedAt).toEqual(resolvedAt);
  });

  it("creates a resolution without selected action", () => {
    const resolvedAt = new Date("2026-01-01T10:00:30.000Z");

    const resolution = TurnResolution.create({
      selectedActionId: null,
      reason: "decision-timeout",
      isTie: false,
      resolvedAt,
    });

    expect(resolution.selectedActionId).toBeNull();
    expect(resolution.reason).toBe("decision-timeout");
    expect(resolution.isTie).toBe(false);
    expect(resolution.resolvedAt).toEqual(resolvedAt);
  });

  it("creates a tied resolution", () => {
    const resolvedAt = new Date("2026-01-01T10:00:30.000Z");

    const resolution = TurnResolution.create({
      selectedActionId: ActionId.create("attack"),
      reason: "all-voted",
      isTie: true,
      resolvedAt,
    });

    expect(resolution.selectedActionId?.value).toBe("attack");
    expect(resolution.reason).toBe("all-voted");
    expect(resolution.isTie).toBe(true);
  });
});