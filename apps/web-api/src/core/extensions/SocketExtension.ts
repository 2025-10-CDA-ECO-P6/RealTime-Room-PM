import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { DIContainer } from "packages/shared/di/src/DIContainer";
import config from "../../configs/Config";

export function SocketExtension(httpServer: HttpServer, container: DIContainer): SocketIOServer {
  console.log("🔌 [Socket.io] Creating and configuring...");

  // ========== Créer Socket.io ==========
  const socketIOServer = new SocketIOServer(httpServer, {
    path: config.socketIoPath,
    cors: {
      origin: config.cors.origin,
      methods: config.cors.methods,
      credentials: true,
    },
    transports: ["websocket"], // ✅ WebSocket only (évite conflits CORS)
    pingInterval: 25000,
    pingTimeout: 60000,
    serveClient: false,
    allowUpgrades: true,
  });

  // ========== Lazy-Load: Injecter les handlers à la PREMIÈRE connexion ==========
  socketIOServer.on("connection", (socket) => {
    console.log("📍 [Socket.io] New connection:", socket.id);

    // ✅ Injection lazy: SocketMessageHandler est maintenant enregistré
    try {
      const messageHandler = container.inject<any>("SocketMessageHandler");
      messageHandler.handleConnection(socket);
    } catch (error) {
      console.error("❌ [Socket.io] Failed to inject SocketMessageHandler:", error);
      socket.disconnect();
    }
  });

  console.log("🔌 [Socket.io] ✅ Ready");

  return socketIOServer;
}