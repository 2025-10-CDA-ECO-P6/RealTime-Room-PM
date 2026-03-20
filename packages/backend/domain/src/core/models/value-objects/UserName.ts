export class UserName {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("UserName cannot be empty");
    }

    if (value.trim().length > 40) {
      throw new Error("UserName cannot exceed 40 characters");
    }
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): UserName {
    return new UserName(value.trim());
  }
}
