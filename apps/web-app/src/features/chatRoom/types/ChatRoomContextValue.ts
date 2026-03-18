import type { ConnectionStatus } from "./ConnectionStatus";
import type { Message } from "./Message";
import type { Room } from "./Room";

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
