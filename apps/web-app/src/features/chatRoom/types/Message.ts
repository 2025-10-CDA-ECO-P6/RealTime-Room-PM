export type MessageType = "user" | "system" | "info";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  type: "user" | "system" | "info";
}