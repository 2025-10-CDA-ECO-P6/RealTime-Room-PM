import { createContext } from "react";
import type { ChatRoomState } from "../types";
import type { CurrentUser } from "../../common/types";

export interface ChatRoomContextValue extends ChatRoomState {
  sendMessage: (content: string) => void;
  joinRoom: (user: CurrentUser) => void;
  leaveRoom: () => void;
}


export const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);
