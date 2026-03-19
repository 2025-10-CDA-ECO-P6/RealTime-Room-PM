import { describe, expect, it, vi } from "vitest";
import { SocketTurnPublisher } from "../../services";
import { IRandomChoicePolicy, Turn } from "@repo/backend-domain";


class FakeRandomChoicePolicy implements IRandomChoicePolicy {
  pickOne<T>(items: T[]): T {
    return items[0];
  }
}

describe("SocketTurnPublisher", () => {
  it("publishes turn updated event", async () => {
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });

    const io = { to } as any;
    const publisher = new SocketTurnPublisher(io);

    const turn = Turn.start({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1", "u2"],
      availableActionIds: ["attack", "defend"],
      startedAt: new Date("2026-01-01T10:00:00.000Z"),
      decisionDurationMs: 30_000,
    });

    turn.vote("u1", "attack", new Date("2026-01-01T10:00:01.000Z"), 3_000);

    await publisher.publishTurnUpdated(turn);

    expect(to).toHaveBeenCalledWith("room_room-1");
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      "rpg_turn_updated",
      expect.objectContaining({
        turnId: turn.id.value,
        roomId: "room-1",
        number: 1,
        status: turn.status,
        userCount: 2,
        presentPlayerIds: ["u1", "u2"],
        availableActionIds: ["attack", "defend"],
      }),
    );
  });

  it("publishes turn closed event", async () => {
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });

    const io = { to } as any;
    const publisher = new SocketTurnPublisher(io);
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

    const resolution = turn.resolution;
    expect(resolution).not.toBeNull();

    await publisher.publishTurnClosed(turn, resolution!);

    expect(to).toHaveBeenCalledWith("room_room-1");
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      "rpg_turn_closed",
      expect.objectContaining({
        turnId: turn.id.value,
        roomId: "room-1",
        number: 1,
        status: "closed",
        resolution: {
          selectedActionId: "attack",
          reason: "finalization-timeout",
          isTie: false,
          resolvedAt: resolution!.resolvedAt,
        },
      }),
    );
  });

  it("publishes null selectedActionId when resolution has no selected action", async () => {
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });

    const io = { to } as any;
    const publisher = new SocketTurnPublisher(io);

    const turn = Turn.start({
      roomId: "room-1",
      number: 1,
      presentPlayerIds: ["u1"],
      availableActionIds: ["attack"],
      startedAt: new Date("2026-01-01T10:00:00.000Z"),
      decisionDurationMs: 30_000,
    });

    const resolution = {
      selectedActionId: null,
      reason: "decision-timeout" as const,
      isTie: false,
      resolvedAt: new Date("2026-01-01T10:00:30.000Z"),
    };

    await publisher.publishTurnClosed(turn, resolution as any);

    expect(emit).toHaveBeenCalledWith(
      "rpg_turn_closed",
      expect.objectContaining({
        resolution: expect.objectContaining({
          selectedActionId: null,
        }),
      }),
    );
  });
});
