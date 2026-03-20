import { Server as SocketIOServer } from "socket.io";
import { ISocketConnection, ISocketServer } from "../interfaces";

import { toSocketRoomChannel } from "../utils";
import { SocketIOConnectionAdapter } from "./SocketIOConnectionAdapter";

export class SocketIOServerAdapter implements ISocketServer {
  private readonly connectionHandlers: Array<(connection: ISocketConnection) => void> = [];

  constructor(private readonly io: SocketIOServer) {
    this.io.on("connection", (socket) => {
      console.log(`[Socket] Connected: ${socket.id}`);

      socket.on("error", (error: unknown) => {
        console.error(`[Socket Error] ${socket.id}:`, error);
      });

      socket.on("disconnect", () => {
        console.log(`[Socket] Disconnected: ${socket.id}`);
      });

      const connection = new SocketIOConnectionAdapter(socket);

      for (const handler of this.connectionHandlers) {
        handler(connection);
      }
    });
  }

  onConnection(handler: (connection: ISocketConnection) => void): void {
    this.connectionHandlers.push(handler);
  }

  emitToRoom(roomId: string, event: string, payload: unknown): void {
    this.io.to(toSocketRoomChannel(roomId)).emit(event, payload);
  }
}