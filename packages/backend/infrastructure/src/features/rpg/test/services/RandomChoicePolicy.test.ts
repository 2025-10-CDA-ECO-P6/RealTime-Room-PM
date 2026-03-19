import { describe, expect, it } from "vitest";
import { RandomChoicePolicy } from "../../services";

describe("RandomChoicePolicy", () => {
  it("returns one element from the provided list", () => {
    const policy = new RandomChoicePolicy();
    const items = ["attack", "defend", "wait"];

    const picked = policy.pickOne(items);

    expect(items.includes(picked)).toBe(true);
  });

  it("throws when trying to pick from an empty list", () => {
    const policy = new RandomChoicePolicy();

    expect(() => policy.pickOne([])).toThrow("Cannot pick from an empty list");
  });

  it("always returns one of the provided items across multiple calls", () => {
    const policy = new RandomChoicePolicy();
    const items = ["attack", "defend", "wait"];

    for (let i = 0; i < 20; i += 1) {
      const picked = policy.pickOne(items);
      expect(items.includes(picked)).toBe(true);
    }
  });
});
