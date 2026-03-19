import { ActionId } from "../../../models/value-objects";
import { describe, expect, it } from "vitest";

describe("ActionId", () => {
  it("creates a valid action id", () => {
    const actionId = ActionId.create("attack");

    expect(actionId.value).toBe("attack");
  });

  it("throws when action id is empty", () => {
    expect(() => ActionId.create("")).toThrow("ActionId cannot be empty");
    expect(() => ActionId.create("   ")).toThrow("ActionId cannot be empty");
  });

  it("compares equality correctly", () => {
    const left = ActionId.create("attack");
    const right = ActionId.create("attack");
    const other = ActionId.create("defend");

    expect(left.equals(right)).toBe(true);
    expect(left.equals(other)).toBe(false);
  });
});
