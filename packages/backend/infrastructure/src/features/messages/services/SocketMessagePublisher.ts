import { IMessagePublisher, Message, RoomId } from "@repo/backend-domain";
import { ISocketServer } from "../../../core";

export class SocketMessagePublisher implements IMessagePublisher {
  constructor(private readonly socketServer: ISocketServer) {}

  publishMessage(roomId: RoomId, message: Message): void {
    this.socketServer.emitToRoom(roomId.value, "message_received", {
      id: message.id.value,
      userId: message.userId.value,
      userName: message.userName.value,
      content: message.content.value,
      timestamp: message.timestamp,
    });

    console.log(`[SocketMessagePublisher] Message sent to room ${roomId.value}`);
  }
}