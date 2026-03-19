import { UserId } from "../value-objects/UserId";
import { UserName } from "../value-objects/UserName";
import { MessageContent } from "../value-objects/MessageContent";
import { MessageId } from "../value-objects/MessageId";

export class Message {
  readonly id: MessageId;
  readonly userId: UserId;
  readonly userName: UserName;
  readonly content: MessageContent;
  readonly timestamp: Date;

  private constructor(id: MessageId, userId: UserId, userName: UserName, content: MessageContent, timestamp: Date) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.content = content;
    this.timestamp = timestamp;
  }

  static create(userId: UserId, userName: UserName, content: MessageContent): Message {
    return new Message(MessageId.generate(), userId, userName, content, new Date());
  }

  static reconstruct(
    id: MessageId,
    userId: UserId,
    userName: UserName,
    content: MessageContent,
    timestamp: Date,
  ): Message {
    return new Message(id, userId, userName, content, timestamp);
  }
}
