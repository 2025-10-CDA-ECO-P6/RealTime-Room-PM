import { Message } from "../models/entities/Message";
import { IChatService } from "./IChatService";

export class ChatService implements IChatService {

  private readonly messages: Map<string, Message> = new Map();

  addMessage(userId: string, content: string): Message {
    if (!userId || !content) {
      throw new Error("userId and content are required");
    }

    const message = Message.create(userId, content);

    this.messages.set(message.id, message);

    console.log(`[ChatService] Message added: ${message.id}`);

    return message;
  }

  getAllMessages(): Message[] {
    return Array.from(this.messages.values());
  }

  getMessagesByUserId(userId: string): Message[] {
    return Array.from(this.messages.values()).filter((msg) => msg.userId === userId);
  }

  deleteMessage(messageId: string): boolean {
    const hasMessage = this.messages.has(messageId);
    if (hasMessage) {
      this.messages.delete(messageId);
      console.log(`[ChatService] Message deleted: ${messageId}`);
    }
    return hasMessage;
  }

  getMessageById(messageId: string): Message | undefined {
    return this.messages.get(messageId);
  }

  clear(): void {
    this.messages.clear();
    console.log("[ChatService] All messages cleared");
  }

  getMessageCount(): number {
    return this.messages.size;
  }
}
