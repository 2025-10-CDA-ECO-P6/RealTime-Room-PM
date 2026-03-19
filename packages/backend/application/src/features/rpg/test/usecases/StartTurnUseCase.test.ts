import { describe, expect, it } from "vitest";
import { FakeClock } from "../mocks/FakeClock";
import { FakeTurnRepository } from "../mocks/FakeTurnRepository";
import { FakeTurnStatePublisher } from "../mocks/FakeTurnStatePublisher";
import { StartTurnUseCase } from "../../usecases/StartTurnUseCase";


describe("StartTurnUseCase", () => {
  it("starts and saves a new turn", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const useCase = new StartTurnUseCase(repository, clock, publisher);

    const result = await useCase.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    expect(result.roomId).toBe("room-1");
    expect(result.number).toBe(1);
    expect(result.status).toBe("open");
    expect(result.userCount).toBe(2);
    expect(result.presentPlayerIds).toEqual(["u1", "u2"]);
    expect(result.availableActionIds).toEqual(["attack", "defend"]);
    expect(result.resolution).toBeNull();
    expect(publisher.updatedTurns).toHaveLength(1);
    expect(publisher.closedTurns).toHaveLength(0);
  });

  it("rejects when an active turn already exists for the room", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const useCase = new StartTurnUseCase(repository, clock, publisher);

    await useCase.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    await expect(
      useCase.execute({
        roomId: "room-1",
        number: 2,
        presentPlayerIds: ["u1", "u2"],
        availableActionIds: ["attack", "defend"],
        decisionDurationMs: 30_000,
      }),
    ).rejects.toThrow('An active turn already exists for room "room-1"');
  });

  it("allows starting a turn in another room", async () => {
    const repository = new FakeTurnRepository();
    const clock = new FakeClock(new Date("2026-01-01T10:00:00.000Z"));
    const publisher = new FakeTurnStatePublisher();

    const useCase = new StartTurnUseCase(repository, clock, publisher);

    await useCase.execute({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      decisionDurationMs: 30_000,
    });

    const result = await useCase.execute({
      roomId: "room-2",
      number: 1,
      presentPlayerIds: ["u3", "u4"],
      availableActionIds: ["wait", "run"],
      decisionDurationMs: 20_000,
    });

    expect(result.roomId).toBe("room-2");
    expect(result.userCount).toBe(2);
    expect(publisher.updatedTurns).toHaveLength(2);
  });
});
