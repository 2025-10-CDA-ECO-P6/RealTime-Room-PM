import { randomUUID } from "node:crypto";

export class Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;

  constructor(id: string, userId: string, content: string, timestamp: Date) {
    this.id = id;
    this.userId = userId;
    this.content = content;
    this.timestamp = timestamp;
  }

  static create(userId: string, content: string): Message {
    const id = this.generateId();
    const timestamp = new Date();
    return new Message(id, userId, content, timestamp);
  }

  private static generateId(): string {
    return `msg_${randomUUID()}`;
  }
}
