import { describe, expect, it } from "vitest";
import { InMemoryTurnRepository } from "../../repositories";
import { IRandomChoicePolicy, Turn } from "@repo/backend-domain";

class FakeRandomChoicePolicy implements IRandomChoicePolicy {
  pickOne<T>(items: T[]): T {
    return items[0];
  }
}

describe("InMemoryTurnRepository", () => {
  it("saves and retrieves a turn by id", async () => {
    const repository = new InMemoryTurnRepository();

    const turn = Turn.start({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      startedAt: new Date("2026-01-01T10:00:00.000Z"),
      decisionDurationMs: 30_000,
    });

    await repository.save(turn);

    const found = await repository.getById(turn.id.value);

    expect(found).not.toBeNull();
    expect(found?.id.value).toBe(turn.id.value);
  });

  it("tracks the current turn by room id while the turn is open", async () => {
    const repository = new InMemoryTurnRepository();

    const turn = Turn.start({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      startedAt: new Date("2026-01-01T10:00:00.000Z"),
      decisionDurationMs: 30_000,
    });

    await repository.save(turn);

    const found = await repository.getCurrentByRoomId("room-1");

    expect(found).not.toBeNull();
    expect(found?.id.value).toBe(turn.id.value);
  });

  it("removes the current room pointer when the turn is closed", async () => {
    const repository = new InMemoryTurnRepository();
    const randomChoicePolicy: IRandomChoicePolicy = new FakeRandomChoicePolicy();

    const turn = Turn.start({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      startedAt: new Date("2026-01-01T10:00:00.000Z"),
      decisionDurationMs: 30_000,
    });

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);
    turn.vote("u2", "attack", new Date("2026-01-01T10:00:02.000Z"), 3_000);
    turn.tick(new Date("2026-01-01T10:00:05.000Z"), randomChoicePolicy);

    await repository.save(turn);

    const found = await repository.getCurrentByRoomId("room-1");

    expect(found).toBeNull();
  });
});
