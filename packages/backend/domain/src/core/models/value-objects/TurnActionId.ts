export class TurnActionId {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("TurnActionId cannot be empty");
    }
  }

  static create(value: string): TurnActionId {
    return new TurnActionId(value.trim());
  }

  equals(other: TurnActionId): boolean {
    return this.value === other.value;
  }
}
