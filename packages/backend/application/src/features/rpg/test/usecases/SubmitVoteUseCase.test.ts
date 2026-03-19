import { describe, expect, it } from "vitest";
import { StartTurnUseCase } from "../../usecases/StartTurnUseCase";
import { SubmitVoteUseCase } from "../../usecases/SubmitVoteUseCase";
import { FakeClock } from "../mocks/FakeClock";
import { FakeTurnRepository } from "../mocks/FakeTurnRepository";
import { FakeTurnStatePublisher } from "../mocks/FakeTurnStatePublisher";

describe("SubmitVoteUseCase", () => {
  it("submits a vote and updates the turn", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2", "u3"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    clock.set(new Date("2026-01-01T10:00:01.000Z"));

    const useCase = new SubmitVoteUseCase(repository, clock, publisher);

    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    expect(result.votes).toHaveLength(1);
    expect(result.votes[0]?.userId).toBe("u1");
    expect(result.votes[0]?.actionId).toBe("attack");
    expect(result.status).toBe("open");
    expect(publisher.updatedTurns.length).toBeGreaterThanOrEqual(2);
    expect(publisher.closedTurns).toHaveLength(0);
  });

  it("replaces the previous vote when the same player votes again", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2", "u3"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    const useCase = new SubmitVoteUseCase(repository, clock, publisher);

    clock.set(new Date("2026-01-01T10:00:01.000Z"));
    await useCase.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:02.000Z"));
    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "defend",
      finalizationDurationMs: 3_000,
    });

    expect(result.votes).toHaveLength(1);
    expect(result.votes[0]?.actionId).toBe("defend");
  });

  it("starts finalization when absolute majority is reached", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2", "u3"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    const useCase = new SubmitVoteUseCase(repository, clock, publisher);

    clock.set(new Date("2026-01-01T10:00:01.000Z"));
    await useCase.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:02.000Z"));
    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u2",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    expect(result.status).toBe("finalizing");
    expect(result.finalizationDeadlineAt).toEqual(new Date("2026-01-01T10:00:05.000Z"));
  });

  it("starts finalization when all present players have voted", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    const useCase = new SubmitVoteUseCase(repository, clock, publisher);

    clock.set(new Date("2026-01-01T10:00:01.000Z"));
    await useCase.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:02.000Z"));
    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u2",
      actionId: "defend",
      finalizationDurationMs: 3_000,
    });

    expect(result.status).toBe("finalizing");
    expect(result.finalizationDeadlineAt).toEqual(new Date("2026-01-01T10:00:05.000Z"));
  });

  it("throws when no active turn exists", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const useCase = new SubmitVoteUseCase(repository, clock, publisher);

    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "u1",
        actionId: "attack",
        finalizationDurationMs: 3_000,
      }),
    ).rejects.toThrow('No active turn found for room "room-1"');
  });

  it("throws when the player is not present", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    const useCase = new SubmitVoteUseCase(repository, clock, publisher);

    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "u9",
        actionId: "attack",
        finalizationDurationMs: 3_000,
      }),
    ).rejects.toThrow('User "u9" is not present in this turn');
  });
});
