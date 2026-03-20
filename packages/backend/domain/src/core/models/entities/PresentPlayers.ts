import { UserId } from "../value-objects";

export class PresentPlayers {
  private readonly players: Map<string, UserId>;

  private constructor(players: Map<string, UserId>) {
    this.players = players;
  }

  static create(initialPlayerIds: UserId[]): PresentPlayers {
    if (initialPlayerIds.length === 0) {
      throw new Error("PresentPlayers cannot be empty");
    }

    const map = new Map<string, UserId>();

    for (const playerId of initialPlayerIds) {
      map.set(playerId.value, playerId);
    }

    return new PresentPlayers(map);
  }

  has(userId: UserId): boolean {
    return this.players.has(userId.value);
  }

  count(): number {
    return this.players.size;
  }

  values(): UserId[] {
    return [...this.players.values()];
  }

  join(userId: UserId): PresentPlayers {
    const next = new Map(this.players);
    next.set(userId.value, userId);
    return new PresentPlayers(next);
  }

  leave(userId: UserId): PresentPlayers {
    const next = new Map(this.players);
    next.delete(userId.value);

    if (next.size === 0) {
      throw new Error("A turn must keep at least one present player");
    }

    return new PresentPlayers(next);
  }
}
