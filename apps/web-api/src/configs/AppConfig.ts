import { Server as SocketIOServer } from "socket.io";
import { DIContainer } from "packages/shared/di/src/DIContainer";

export interface AppConfigInitial {
  container: DIContainer;
  socketServer: null | undefined;
}

export interface AppConfigFinal {
  container: DIContainer;
  socketServer: SocketIOServer;
}

export type AppConfig = AppConfigInitial | AppConfigFinal;