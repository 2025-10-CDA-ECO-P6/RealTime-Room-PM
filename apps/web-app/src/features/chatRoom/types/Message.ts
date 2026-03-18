export type MessageType = "user" | "system" | "info";

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  type: MessageType;
}
