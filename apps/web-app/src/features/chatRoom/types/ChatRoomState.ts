import type { ConnectionStatus } from "./ConnectionStatus";
import type { Message } from "./Message";
import type { Room } from "./Room";

export interface ChatRoomState {
  roomId: string;
  room: Room | null;
  messages: Message[];
  connectionStatus: ConnectionStatus;
  isJoined: boolean;
  error: string | null;
}

export const initialState: ChatRoomState = {
  roomId: "",
  room: null,
  messages: [],
  connectionStatus: "disconnected",
  isJoined: false,
  error: null,
};
