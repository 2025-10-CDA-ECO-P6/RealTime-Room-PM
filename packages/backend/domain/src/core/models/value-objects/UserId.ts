export class UserId {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("UserId cannot be empty");
    }
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): UserId {
    return new UserId(value);
  }
}
