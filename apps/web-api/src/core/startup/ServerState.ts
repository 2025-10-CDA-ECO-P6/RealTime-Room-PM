import { DIContainer } from "@repo/di";
import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

export interface ServerState {
  httpServer: HttpServer;
  socketIOServer: SocketIOServer;
  container: DIContainer;
  isRunning: boolean;
}
