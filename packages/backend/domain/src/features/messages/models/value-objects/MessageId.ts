import { randomUUID } from "node:crypto";

export class MessageId {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("MessageId cannot be empty");
    }
  }

  equals(other: MessageId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static generate(): MessageId {
    return new MessageId(`msg_${randomUUID()}`);
  }

  static create(value: string): MessageId {
    return new MessageId(value);
  }
}
