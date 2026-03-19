import { describe, expect, it } from "vitest";
import { TurnId } from "../../../models/value-objects";

describe("TurnId", () => {
  it("creates a valid turn id", () => {
    const turnId = TurnId.create("turn_1");

    expect(turnId.value).toBe("turn_1");
  });

  it("generates a turn id", () => {
    const turnId = TurnId.generate();

    expect(turnId.value.startsWith("turn_")).toBe(true);
  });

  it("throws when turn id is empty", () => {
    expect(() => TurnId.create("")).toThrow("TurnId cannot be empty");
    expect(() => TurnId.create("   ")).toThrow("TurnId cannot be empty");
  });

  it("compares equality correctly", () => {
    const left = TurnId.create("turn_1");
    const right = TurnId.create("turn_1");
    const other = TurnId.create("turn_2");

    expect(left.equals(right)).toBe(true);
    expect(left.equals(other)).toBe(false);
  });
});
