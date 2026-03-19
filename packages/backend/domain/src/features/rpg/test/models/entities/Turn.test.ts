import { describe, expect, it } from "vitest";
import { IRandomChoicePolicy } from "../../../interfaces";
import { Turn } from "../../../models/entities/Turn";


class FakeRandomChoicePolicy implements IRandomChoicePolicy {
  pickOne<T>(items: T[]): T {
    return items[0];
  }
}

const randomChoicePolicy = new FakeRandomChoicePolicy();

const createTurn = () =>
  Turn.start({
    roomId: "room-1",
    number: 1,
    presentPlayerIds: ["u1", "u2", "u3"],
    availableActionIds: ["attack", "defend", "wait"],
    startedAt: new Date("2026-01-01T10:00:00.000Z"),
    decisionDurationMs: 30_000,
  });

describe("Turn", () => {
  it("starts a valid turn", () => {
    const turn = createTurn();

    expect(turn.roomId).toBe("room-1");
    expect(turn.number).toBe(1);
    expect(turn.status).toBe("open");
    expect(turn.userCount).toBe(3);
    expect(turn.presentPlayers).toEqual(["u1", "u2", "u3"]);
    expect(turn.votes).toHaveLength(0);
    expect(turn.resolution).toBeNull();
  });

  it("throws when started without actions", () => {
    expect(() =>
      Turn.start({
        roomId: "room-1",
        number: 1,
        presentPlayerIds: ["u1"],
        availableActionIds: [],
        startedAt: new Date("2026-01-01T10:00:00.000Z"),
        decisionDurationMs: 30_000,
      }),
    ).toThrow("Turn must have at least one available action");
  });

  it("throws when started without players", () => {
    expect(() =>
      Turn.start({
        roomId: "room-1",
        number: 1,
        presentPlayerIds: [],
        availableActionIds: ["attack"],
        startedAt: new Date("2026-01-01T10:00:00.000Z"),
        decisionDurationMs: 30_000,
      }),
    ).toThrow("PresentPlayers cannot be empty");
  });

  it("throws when decision duration is invalid", () => {
    expect(() =>
      Turn.start({
        roomId: "room-1",
        number: 1,
        presentPlayerIds: ["u1"],
        availableActionIds: ["attack"],
        startedAt: new Date("2026-01-01T10:00:00.000Z"),
        decisionDurationMs: 0,
      }),
    ).toThrow("decisionDurationMs must be greater than 0");
  });

  it("accepts a valid vote", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);

    expect(turn.votes).toHaveLength(1);
    expect(turn.getVoteCountFor("attack")).toBe(1);
  });

  it("rejects a vote from an absent player", () => {
    const turn = createTurn();

    expect(() => turn.vote("u9", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000)).toThrow(
      'User "u9" is not present in this turn',
    );
  });

  it("rejects a vote for an unknown action", () => {
    const turn = createTurn();

    expect(() => turn.vote("u1", "spell", new Date("2026-01-01T10:00:01.000Z"), 3_000)).toThrow(
      'Unknown action "spell" for this turn',
    );
  });

  it("replaces the previous vote when the same player votes again", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u1", "defend", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    expect(turn.votes).toHaveLength(1);
    expect(turn.getVoteCountFor("attack")).toBe(0);
    expect(turn.getVoteCountFor("defend")).toBe(1);
  });

  it("detects absolute majority", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    expect(turn.hasAbsoluteMajority()).toBe(false);

    turn.vote("u2", "attack", new Date("2026-01-01T10:00:02.000Z"), 3_000);
    expect(turn.hasAbsoluteMajority()).toBe(true);
  });

  it("detects when all present players have voted", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "defend", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    expect(turn.haveAllPresentPlayersVoted()).toBe(false);

    turn.vote("u3", "wait", new Date("2026-01-01T10:00:03.000Z"), 3_000);

    expect(turn.haveAllPresentPlayersVoted()).toBe(true);
  });

  it("starts finalization when absolute majority is reached", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    expect(turn.status).toBe("open");
    expect(turn.voteWindow.finalizationDeadlineAt).toBeNull();

    turn.vote("u2", "attack", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    expect(turn.status).toBe("finalizing");
    expect(turn.voteWindow.finalizationDeadlineAt).toEqual(new Date("2026-01-01T10:00:05.000Z"));
  });

  it("starts finalization when all present players have voted", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "defend", new Date("2026-01-01T10:00:02.000Z"), 3_000);
    turn.vote("u3", "wait", new Date("2026-01-01T10:00:03.000Z"), 3_000);

    expect(turn.status).toBe("finalizing");
    expect(turn.voteWindow.finalizationDeadlineAt).toEqual(new Date("2026-01-01T10:00:06.000Z"));
  });

  it("cancels finalization if a changed vote breaks the absolute majority", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "attack", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    expect(turn.status).toBe("finalizing");

    turn.vote("u2", "defend", new Date("2026-01-01T10:00:03.000Z"), 3_000);

    expect(turn.status).toBe("open");
    expect(turn.voteWindow.finalizationDeadlineAt).toBeNull();
  });

  it("cancels finalization when a new player joins and all-voted is no longer true", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "defend", new Date("2026-01-01T10:00:02.000Z"), 3_000);
    turn.vote("u3", "wait", new Date("2026-01-01T10:00:03.000Z"), 3_000);

    expect(turn.status).toBe("finalizing");

    turn.joinPlayer("u4", new Date("2026-01-01T10:00:04.000Z"), 3_000);

    expect(turn.userCount).toBe(4);
    expect(turn.haveAllPresentPlayersVoted()).toBe(false);
    expect(turn.status).toBe("open");
    expect(turn.voteWindow.finalizationDeadlineAt).toBeNull();
  });

  it("removes a leaving player's vote", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "attack", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    expect(turn.getVoteCountFor("attack")).toBe(2);

    turn.leavePlayer("u2", new Date("2026-01-01T10:00:03.000Z"), 3_000);

    expect(turn.userCount).toBe(2);
    expect(turn.getVoteCountFor("attack")).toBe(1);
  });

  it("recalculates majority after a player leaves", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    expect(turn.hasAbsoluteMajority()).toBe(false);

    turn.leavePlayer("u3", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    expect(turn.userCount).toBe(2);
    expect(turn.hasAbsoluteMajority()).toBe(false);

    turn.vote("u2", "attack", new Date("2026-01-01T10:00:03.000Z"), 3_000);

    expect(turn.hasAbsoluteMajority()).toBe(true);
    expect(turn.status).toBe("finalizing");
  });

  it("closes on decision timeout", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.tick(new Date("2026-01-01T10:00:30.000Z"), randomChoicePolicy);

    expect(turn.status).toBe("closed");
    expect(turn.resolution).not.toBeNull();
    expect(turn.resolution?.reason).toBe("decision-timeout");
    expect(turn.resolution?.selectedActionId?.value).toBe("attack");
  });

  it("closes on finalization timeout", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "attack", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    expect(turn.status).toBe("finalizing");

    turn.tick(new Date("2026-01-01T10:00:05.000Z"), randomChoicePolicy);

    expect(turn.status).toBe("closed");
    expect(turn.resolution).not.toBeNull();
    expect(turn.resolution?.reason).toBe("finalization-timeout");
    expect(turn.resolution?.selectedActionId?.value).toBe("attack");
  });

  it("chooses a random winner among tied actions", () => {
    const turn = Turn.start({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      startedAt: new Date("2026-01-01T10:00:00.000Z"),
      decisionDurationMs: 30_000,
    });

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "defend", new Date("2026-01-01T10:00:02.000Z"), 3_000);

    turn.tick(new Date("2026-01-01T10:00:05.000Z"), randomChoicePolicy);

    expect(turn.status).toBe("closed");
    expect(turn.resolution).not.toBeNull();
    expect(turn.resolution?.isTie).toBe(true);
    expect(turn.resolution?.selectedActionId?.value).toBe("attack");
  });

  it("does nothing on tick when already closed", () => {
    const turn = createTurn();

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.tick(new Date("2026-01-01T10:00:30.000Z"), randomChoicePolicy);

    const firstResolution = turn.resolution;

    turn.tick(new Date("2026-01-01T10:01:00.000Z"), randomChoicePolicy);

    expect(turn.resolution).toBe(firstResolution);
    expect(turn.status).toBe("closed");
  });

  it("throws when trying to modify a closed turn", () => {
    const turn = createTurn();

    turn.tick(new Date("2026-01-01T10:00:30.000Z"), randomChoicePolicy);

    expect(() => turn.vote("u1", "attack", new Date("2026-01-01T10:00:31.000Z"), 3_000)).toThrow(
      "Cannot modify a closed turn",
    );

    expect(() => turn.joinPlayer("u4", new Date("2026-01-01T10:00:31.000Z"), 3_000)).toThrow(
      "Cannot modify a closed turn",
    );

    expect(() => turn.leavePlayer("u1", new Date("2026-01-01T10:00:31.000Z"), 3_000)).toThrow(
      "Cannot modify a closed turn",
    );
  });
});
