import { randomUUID } from "node:crypto";

export class TurnId {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("TurnId cannot be empty");
    }
  }

  static generate(): TurnId {
    return new TurnId(`turn_${randomUUID()}`);
  }

  static create(value: string): TurnId {
    return new TurnId(value);
  }

  equals(other: TurnId): boolean {
    return this.value === other.value;
  }
}
