import { describe, expect, it } from "vitest";
import { SystemClock } from "../../services";

describe("SystemClock", () => {
  it("returns a Date instance", () => {
    const clock = new SystemClock();

    const now = clock.now();

    expect(now).toBeInstanceOf(Date);
  });

  it("returns a date close to the current system time", () => {
    const clock = new SystemClock();

    const before = Date.now();
    const now = clock.now().getTime();
    const after = Date.now();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(after);
  });
});
