import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import config from "../../configs/Config";


export function SocketExtension(httpServer: HttpServer): SocketIOServer {
  return new SocketIOServer(httpServer, {
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
}
