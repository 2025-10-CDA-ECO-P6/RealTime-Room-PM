import { SocketConnectionContext } from "../types";

export interface ISocketConnection {
  readonly id: string;

  getContext(): SocketConnectionContext;
  setContext(context: Partial<SocketConnectionContext>): void;

  joinRoom(roomId: string): Promise<void> | void;
  leaveRoom(roomId: string): Promise<void> | void;

  emit(event: string, payload: unknown): void;
  on(event: string, handler: (payload: unknown) => void | Promise<void>): void;
}
