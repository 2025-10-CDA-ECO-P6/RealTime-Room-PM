import { describe, expect, it } from "vitest";
import { StartTurnUseCase } from "../../usecases/StartTurnUseCase";
import { SubmitVoteUseCase } from "../../usecases/SubmitVoteUseCase";
import { LeaveTurnPlayerUseCase } from "../../usecases/LeaveTurnPlayerUseCase";
import { FakeClock } from "../mocks/FakeClock";
import { FakeTurnRepository } from "../mocks/FakeTurnRepository";
import { FakeTurnStatePublisher } from "../mocks/FakeTurnStatePublisher";

describe("LeaveTurnPlayerUseCase", () => {
  it("removes a player from the current turn", async () => {
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

    const useCase = new LeaveTurnPlayerUseCase(repository, clock, publisher);

    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u3",
      finalizationDurationMs: 3_000,
    });

    expect(result.userCount).toBe(2);
    expect(result.presentPlayerIds).not.toContain("u3");
  });

  it("removes the leaving player's vote", async () => {
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

    const submitVote = new SubmitVoteUseCase(repository, clock, publisher);

    clock.set(new Date("2026-01-01T10:00:01.000Z"));
    await submitVote.execute({
      roomId: "room-1",
      userId: "u3",
      actionId: "attack",
      finalizationDurationMs: 3_000,
    });

    clock.set(new Date("2026-01-01T10:00:02.000Z"));

    const useCase = new LeaveTurnPlayerUseCase(repository, clock, publisher);

    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u3",
      finalizationDurationMs: 3_000,
    });

    expect(result.votes.find((vote) => vote.userId === "u3")).toBeUndefined();
  });

  it("can trigger finalization after a player leaves if all remaining players have voted", async () => {
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

    clock.set(new Date("2026-01-01T10:00:03.000Z"));

    const useCase = new LeaveTurnPlayerUseCase(repository, clock, publisher);

    const result = await useCase.execute({
      roomId: "room-1",
      userId: "u3",
      finalizationDurationMs: 3_000,
    });

    expect(result.userCount).toBe(2);
    expect(result.status).toBe("finalizing");
    expect(result.finalizationDeadlineAt).toEqual(new Date("2026-01-01T10:00:06.000Z"));
  });

  it("throws when no active turn exists", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const useCase = new LeaveTurnPlayerUseCase(repository, clock, publisher);

    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "u3",
        finalizationDurationMs: 3_000,
      }),
    ).rejects.toThrow('No active turn found for room "room-1"');
  });
});
