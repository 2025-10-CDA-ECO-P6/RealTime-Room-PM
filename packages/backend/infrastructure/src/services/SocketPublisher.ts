import { IMessagePublisher } from "@repo/backend-domain/src/features/messages/interfaces/IMessagePublisher";
import { Message } from "@repo/backend-domain/src/features/messages/models/entities/Message";
import { Server as SocketIOServer } from "socket.io";

export class SocketPublisher implements IMessagePublisher {
  constructor(private readonly socketIOServer: SocketIOServer) {}

  publishMessage(message: Message): void {
    try {
      // Émet l'événement à tous les clients connectés
      this.socketIOServer.emit("message_published", {
        id: message.id,
        userId: message.userId,
        content: message.content,
        timestamp: message.timestamp,
      });

      console.log(`[SocketPublisher] Message published: ${message.id}`);
    } catch (error) {
      console.error("[SocketPublisher] Error publishing message:", error);
    }
  }

  publishMessageToUser(userId: string, message: Message): void {
    try {
      this.socketIOServer.to(`user_${userId}`).emit("message_published", {
        id: message.id,
        userId: message.userId,
        content: message.content,
        timestamp: message.timestamp,
      });

      console.log(`[SocketPublisher] Message published to user ${userId}: ${message.id}`);
    } catch (error) {
      console.error("[SocketPublisher] Error publishing message:", error);
    }
  }

  publishMessageToRoom(roomId: string, message: Message): void {
    try {
      this.socketIOServer.to(`room_${roomId}`).emit("message_published", {
        id: message.id,
        userId: message.userId,
        content: message.content,
        timestamp: message.timestamp,
      });

      console.log(`[SocketPublisher] Message published to room ${roomId}: ${message.id}`);
    } catch (error) {
      console.error("[SocketPublisher] Error publishing message:", error);
    }
  }
}
 