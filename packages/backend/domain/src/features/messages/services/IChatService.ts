import { Message } from "../models/entities/Message";

export interface IChatService {
  addMessage(userId: string, content: string): Message;
  getAllMessages(): Message[];
  getMessagesByUserId(userId: string): Message[];
  deleteMessage(messageId: string): boolean;
}
 