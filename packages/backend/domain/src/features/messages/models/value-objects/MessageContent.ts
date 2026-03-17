export class MessageContent {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("MessageContent cannot be empty");
    }
    if (value.length > 5000) {
      throw new Error("MessageContent cannot exceed 5000 characters");
    }
  }

  equals(other: MessageContent): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): MessageContent {
    return new MessageContent(value.trim());
  }
}
