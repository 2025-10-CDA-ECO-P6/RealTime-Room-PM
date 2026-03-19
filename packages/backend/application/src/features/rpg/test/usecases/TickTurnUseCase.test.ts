import { describe, expect, it } from "vitest";
import { StartTurnUseCase } from "../../usecases/StartTurnUseCase";
import { SubmitVoteUseCase } from "../../usecases/SubmitVoteUseCase";
import { TickTurnUseCase } from "../../usecases/TickTurnUseCase";
import { FakeClock } from "../mocks/FakeClock";
import { FakeRandomChoicePolicy } from "../mocks/FakeRandomChoicePolicy";
import { FakeTurnRepository } from "../mocks/FakeTurnRepository";
import { FakeTurnStatePublisher } from "../mocks/FakeTurnStatePublisher";

describe("TickTurnUseCase", () => {
  it("returns null when no active turn exists", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const random = new FakeRandomChoicePolicy();
    const publisher = new FakeTurnStatePublisher();

    const useCase = new TickTurnUseCase(repository, clock, random, publisher);

    const result = await useCase.execute({ roomId: "room-1" });

    expect(result).toBeNull();
  });

  it("does not close a turn before deadlines", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const random = new FakeRandomChoicePolicy();
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    clock.set(new Date("2026-01-01T10:00:10.000Z"));

    const useCase = new TickTurnUseCase(repository, clock, random, publisher);

    const result = await useCase.execute({ roomId: "room-1" });

    expect(result).not.toBeNull();
    expect(result?.status).toBe("open");
    expect(result?.resolution).toBeNull();
    expect(publisher.closedTurns).toHaveLength(0);
  });

  it("closes a turn when decision timeout is reached", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const random = new FakeRandomChoicePolicy();
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    clock.set(new Date("2026-01-01T10:00:30.000Z"));

    const useCase = new TickTurnUseCase(repository, clock, random, publisher);

    const result = await useCase.execute({ roomId: "room-1" });

    expect(result).not.toBeNull();
    expect(result?.status).toBe("closed");
    expect(result?.resolution?.reason).toBe("decision-timeout");
    expect(publisher.closedTurns).toHaveLength(1);
  });

  it("closes a turn when finalization timeout is reached", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const random = new FakeRandomChoicePolicy();
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2", "u3"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    const submitVote = new SubmitVoteUseCase(repository, clock, publisher);

    clock.set(new Date("2026-01-01T10:00:01.000Z"));
    await submitVote.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:02.000Z"));
    await submitVote.execute({
      roomId: "room-1",
      userId: "u2",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:05.000Z"));

    const useCase = new TickTurnUseCase(repository, clock, random, publisher);

    const result = await useCase.execute({ roomId: "room-1" });

    expect(result).not.toBeNull();
    expect(result?.status).toBe("closed");
    expect(result?.resolution?.reason).toBe("finalization-timeout");
    expect(result?.resolution?.selectedActionId).toBe("attack");
    expect(publisher.closedTurns).toHaveLength(1);
  });

  it("uses the random choice policy when there is a tie", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const random = new FakeRandomChoicePolicy();
    const publisher = new FakeTurnStatePublisher();

    const startTurn = new StartTurnUseCase(repository, clock, publisher);

    await startTurn.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    const submitVote = new SubmitVoteUseCase(repository, clock, publisher);

    clock.set(new Date("2026-01-01T10:00:01.000Z"));
    await submitVote.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:02.000Z"));
    await submitVote.execute({
      roomId: "room-1",
      userId: "u2",
      actionId: "defend",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:05.000Z"));

    const useCase = new TickTurnUseCase(repository, clock, random, publisher);

    const result = await useCase.execute({ roomId: "room-1" });

    expect(result).not.toBeNull();
    expect(result?.status).toBe("closed");
    expect(result?.resolution?.isTie).toBe(true);
    expect(result?.resolution?.selectedActionId).toBe("attack");
  });
});
