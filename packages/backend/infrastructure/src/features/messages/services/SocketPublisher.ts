import { IMessagePublisher, RoomId, Message } from "@repo/backend-domain";
import { Server as SocketIOServer } from "socket.io";

export class SocketPublisher implements IMessagePublisher {
  constructor(private readonly io: SocketIOServer) {}

  publishMessage(roomId: RoomId, message: Message): void {
    this.io.to(`room_${roomId.value}`).emit("message_received", {
      id: message.id.value,
      userId: message.userId.value,
      userName: message.userName.value,
      content: message.content.value,
      timestamp: message.timestamp,
    });

    console.log(`[SocketPublisher] Message sent to room ${roomId.value}`);
  }
}
