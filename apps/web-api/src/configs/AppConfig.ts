import { DIContainer } from "@repo/di";
import { Server as SocketIOServer } from "socket.io";

export interface AppConfigInitial {
  container: DIContainer;
  socketServer: null | undefined;
}

export interface AppConfigFinal {
  container: DIContainer;
  socketServer: SocketIOServer;
}

export type AppConfig = AppConfigInitial | AppConfigFinal;
