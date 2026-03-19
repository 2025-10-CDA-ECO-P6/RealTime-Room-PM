export class PresentPlayers {
  private readonly players: Set<string>;

  private constructor(players: Set<string>) {
    this.players = players;
  }

  static create(initialPlayerIds: string[]): PresentPlayers {
    const sanitized = initialPlayerIds.map((id) => id.trim()).filter(Boolean);

    if (sanitized.length === 0) {
      throw new Error("PresentPlayers cannot be empty");
    }

    return new PresentPlayers(new Set(sanitized));
  }

  has(userId: string): boolean {
    return this.players.has(userId);
  }

  count(): number {
    return this.players.size;
  }

  values(): string[] {
    return [...this.players];
  }

  join(userId: string): PresentPlayers {
    const next = new Set(this.players);
    next.add(userId);
    return new PresentPlayers(next);
  }

  leave(userId: string): PresentPlayers {
    const next = new Set(this.players);
    next.delete(userId);

    if (next.size === 0) {
      throw new Error("A turn must keep at least one present player");
    }

    return new PresentPlayers(next);
  }
}
