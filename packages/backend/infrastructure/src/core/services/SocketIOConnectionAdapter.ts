import { Socket } from "socket.io";
import { ISocketConnection } from "../interfaces/ISocketConnection";
import { SocketConnectionContext } from "../types/SocketConnectionContext";
import { toSocketRoomChannel } from "../utils";

export class SocketIOConnectionAdapter implements ISocketConnection {
  constructor(private readonly socket: Socket) {}

  get id(): string {
    return this.socket.id;
  }

  getContext(): SocketConnectionContext {
    return (this.socket.data ?? {}) as SocketConnectionContext;
  }

  setContext(context: Partial<SocketConnectionContext>): void {
    this.socket.data = {
      ...this.socket.data,
      ...context,
    };
  }

  joinRoom(roomId: string): void {
    this.socket.join(toSocketRoomChannel(roomId));
  }

  leaveRoom(roomId: string): void {
    this.socket.leave(toSocketRoomChannel(roomId));
  }

  emit(event: string, payload: unknown): void {
    this.socket.emit(event, payload);
  }

  on(event: string, handler: (payload: unknown) => void | Promise<void>): void {
    this.socket.on(event, async (payload: unknown) => {
      await handler(payload);
    });
  }
}
