import type { ConnectionStatus } from "./ConnectionStatus";
import type { Message } from "./Message";
import type { Room } from "./Room";

export type ChatRoomAction =
  | { type: "SET_ROOM_ID"; payload: string }
  | { type: "SET_ROOM"; payload: Room | null }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "CLEAR_MESSAGES" }
  | { type: "SET_CONNECTION_STATUS"; payload: ConnectionStatus }
  | { type: "SET_IS_JOINED"; payload: boolean }
  | { type: "SET_USER_COUNT"; payload: number }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };