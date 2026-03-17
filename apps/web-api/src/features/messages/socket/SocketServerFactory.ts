import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "node:http";
import config from "../../../configs/Config";
import { DIContainer } from "packages/shared/di/src/DIContainer";
import { SocketMessageHandler } from "./SocketMessageHandler";

export class SocketServerFactory {
  /**
   * Crée une instance Socket.io configurée et prête à l'emploi
   * @param httpServer Le serveur HTTP Node.js
   * @param container Le container d'injection de dépendances
   * @returns Une instance Socket.io initialisée et configurée
   */
  static createSocketServer(httpServer: HttpServer, container: DIContainer): SocketIOServer {
    // Création de l'instance Socket.io
    const io = new SocketIOServer(httpServer, {
      path: config.socketIoPath,
      cors: {
        origin: config.cors.origin,
        methods: config.cors.methods,
        credentials: true, // ✅ Autorise les credentials
      },
      transports: ["websocket", "polling"], // ✅ Support WebSocket et polling
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    // Récupère le handler depuis le container DI
    const messageHandler = container.inject<SocketMessageHandler>("SocketMessageHandler");

    // Configure les listeners pour chaque nouvelle connexion
    io.on("connection", (socket) => {
      messageHandler.handleConnection(socket);
    });

    // Gestion des erreurs globales de Socket.io
    io.on("error", (error: any) => {
      console.error("[Socket.io Error]:", error);
    });

    console.log("[Socket.io] ✅ Server initialized and ready");

    return io;
  }
}
