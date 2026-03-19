export class ActionId {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("ActionId cannot be empty");
    }
  }

  static create(value: string): ActionId {
    return new ActionId(value);
  }

  equals(other: ActionId): boolean {
    return this.value === other.value;
  }
}
