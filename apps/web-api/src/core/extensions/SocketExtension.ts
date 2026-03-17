import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import config from "../../configs/Config";
import { DIContainer } from "@repo/di";

export function SocketExtension(httpServer: HttpServer, container: DIContainer): SocketIOServer {
  const socketIOServer = new SocketIOServer(httpServer, {
    path: config.socketIoPath,
    cors: {
      origin: config.cors.origin,
      methods: config.cors.methods,
      credentials: true,
    },
    transports: ["websocket"],
    pingInterval: 25000,
    pingTimeout: 60000,
    serveClient: false,
    allowUpgrades: true,
  });

  socketIOServer.on("connection", (socket) => {
    try {
      const socketServer = container.inject<any>("SocketServer");
      socketServer.handleConnection(socket);
    } catch (error) {
      console.error("[Socket.io] Failed to inject SocketServer:", error);
      socket.disconnect();
    }
  });

  return socketIOServer;
}
