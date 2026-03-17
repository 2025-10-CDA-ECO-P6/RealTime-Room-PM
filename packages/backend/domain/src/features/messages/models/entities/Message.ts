import { UserId } from "../value-objects/UserId";
import { MessageContent } from "../value-objects/MessageContent";
import { MessageId } from "../value-objects/MessageId";

export class Message {
  readonly id: MessageId;
  readonly userId: UserId;
  readonly content: MessageContent;
  readonly timestamp: Date;

  private constructor(id: MessageId, userId: UserId, content: MessageContent, timestamp: Date) {
    this.id = id;
    this.userId = userId;
    this.content = content;
    this.timestamp = timestamp;
  }

  static create(userId: UserId, content: MessageContent): Message {
    return new Message(MessageId.generate(), userId, content, new Date());
  }

  static reconstruct(id: MessageId, userId: UserId, content: MessageContent, timestamp: Date): Message {
    return new Message(id, userId, content, timestamp);
  }
}
 