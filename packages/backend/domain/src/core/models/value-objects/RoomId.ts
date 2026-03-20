export class RoomId {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("RoomId cannot be empty");
    }
  }

  equals(other: RoomId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): RoomId {
    return new RoomId(value);
  }
}
