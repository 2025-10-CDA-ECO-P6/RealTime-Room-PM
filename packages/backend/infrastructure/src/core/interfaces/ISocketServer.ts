import { ISocketConnection } from "./ISocketConnection";

export interface ISocketServer {
  onConnection(handler: (connection: ISocketConnection) => void): void;
  emitToRoom(roomId: string, event: string, payload: unknown): void;
}