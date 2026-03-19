import { describe, expect, it } from "vitest";
import { TurnVote } from "../../../models/entities";
import { ActionId } from "../../../models/value-objects";


describe("TurnVote", () => {
  it("creates a valid vote", () => {
    const votedAt = new Date("2026-01-01T10:00:00.000Z");
    const vote = TurnVote.create("u1", ActionId.create("attack"), votedAt);

    expect(vote.userId).toBe("u1");
    expect(vote.actionId.value).toBe("attack");
    expect(vote.votedAt).toEqual(votedAt);
  });

  it("throws when user id is empty", () => {
    expect(() => TurnVote.create("", ActionId.create("attack"), new Date())).toThrow("TurnVote userId cannot be empty");
  });

  it("detects if vote comes from a given user", () => {
    const vote = TurnVote.create("u1", ActionId.create("attack"), new Date());

    expect(vote.isFrom("u1")).toBe(true);
    expect(vote.isFrom("u2")).toBe(false);
  });
});
