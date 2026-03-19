import { describe, expect, it } from "vitest";
import { PresentPlayers } from "../../../models/value-objects";


describe("PresentPlayers", () => {
  it("creates a valid list of present players", () => {
    const players = PresentPlayers.create(["u1", "u2"]);

    expect(players.count()).toBe(2);
    expect(players.values()).toEqual(["u1", "u2"]);
  });

  it("sanitizes empty values on creation", () => {
    const players = PresentPlayers.create(["u1", "   ", "u2"]);

    expect(players.values()).toEqual(["u1", "u2"]);
  });

  it("throws when created with no valid players", () => {
    expect(() => PresentPlayers.create([])).toThrow("PresentPlayers cannot be empty");
    expect(() => PresentPlayers.create(["", "   "])).toThrow("PresentPlayers cannot be empty");
  });

  it("detects whether a user is present", () => {
    const players = PresentPlayers.create(["u1", "u2"]);

    expect(players.has("u1")).toBe(true);
    expect(players.has("u3")).toBe(false);
  });

  it("joins a new player", () => {
    const players = PresentPlayers.create(["u1", "u2"]);
    const updated = players.join("u3");

    expect(updated.count()).toBe(3);
    expect(updated.has("u3")).toBe(true);
    expect(players.count()).toBe(2);
  });

  it("does not duplicate a player on join", () => {
    const players = PresentPlayers.create(["u1", "u2"]);
    const updated = players.join("u2");

    expect(updated.count()).toBe(2);
    expect(updated.values()).toEqual(["u1", "u2"]);
  });

  it("removes a player", () => {
    const players = PresentPlayers.create(["u1", "u2", "u3"]);
    const updated = players.leave("u3");

    expect(updated.count()).toBe(2);
    expect(updated.has("u3")).toBe(false);
  });

  it("throws when removing the last player", () => {
    const players = PresentPlayers.create(["u1"]);

    expect(() => players.leave("u1")).toThrow("A turn must keep at least one present player");
  });
});
