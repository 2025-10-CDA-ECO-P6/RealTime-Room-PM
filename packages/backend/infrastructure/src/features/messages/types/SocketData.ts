import { RoomId, UserId } from "@repo/backend-domain";

export interface SocketData {
  roomId?: RoomId;
  userId?: UserId;
}
