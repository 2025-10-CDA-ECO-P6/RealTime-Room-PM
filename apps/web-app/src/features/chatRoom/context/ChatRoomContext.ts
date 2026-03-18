import { createContext } from "react";
import type { ConnectionStatus, Message, Room } from "../types";

export interface ChatRoomContextValue {
  roomId: string;
  room: Room | null;
  messages: Message[];
  connectionStatus: ConnectionStatus;
  isJoined: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
  joinRoom: (userId: string) => void;
  leaveRoom: () => void;
}

export const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);
