import { describe, expect, it } from "vitest";
import { StartTurnUseCase } from "../../usecases/StartTurnUseCase";
import { SubmitVoteUseCase } from "../../usecases/SubmitVoteUseCase";
import { JoinTurnPlayerUseCase } from "../../usecases/JoinTurnPlayerUseCase";
import { FakeClock } from "../mocks/FakeClock";
import { FakeTurnRepository } from "../mocks/FakeTurnRepository";
import { FakeTurnStatePublisher } from "../mocks/FakeTurnStatePublisher";

describe("JoinTurnPlayerUseCase", () => {
  it("adds a player to the current turn", async () => {
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

    clock.set(new Date("2026-01-01T10:00:02.000Z"));

    const useCase = new JoinTurnPlayerUseCase(repository, clock, publisher);

    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u3",
      finalizationDurationMs: 3_000,
    });

    expect(result.userCount).toBe(3);
    expect(result.presentPlayerIds).toContain("u3");
  });

  it("cancels finalization when a new player joins and all-voted is no longer true", async () => {
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

    const submitVote = new SubmitVoteUseCase(repository, clock, publisher);

    clock.set(new Date("2026-01-01T10:00:01.000Z"));
    await submitVote.execute({
      roomId: "room-1",
      userId: "u1",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:02.000Z"));
    const stateBeforeJoin = await submitVote.execute({
      roomId: "room-1",
      userId: "u2",
      actionId: "defend",
      finalizationDurationMs: 3_000,
    });

    expect(stateBeforeJoin.status).toBe("finalizing");

    clock.set(new Date("2026-01-01T10:00:03.000Z"));

    const joinUseCase = new JoinTurnPlayerUseCase(repository, clock, publisher);

    const result = await joinUseCase.execute({
      roomId: "room-1",
      userId: "u3",
      finalizationDurationMs: 3_000,
    });

    expect(result.status).toBe("open");
    expect(result.userCount).toBe(3);
    expect(result.finalizationDeadlineAt).toBeNull();
  });

  it("throws when no active turn exists", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const useCase = new JoinTurnPlayerUseCase(repository, clock, publisher);

    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "u3",
        finalizationDurationMs: 3_000,
      }),
    ).rejects.toThrow('No active turn found for room "room-1"');
  });
});
