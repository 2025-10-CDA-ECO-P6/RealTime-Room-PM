import { Socket } from "socket.io";
import { SendMessageUseCase } from "@repo/backend-application/src/features/messages/use-cases/SendMessageUseCase";
import { SendMessageDTO } from "@repo/backend-application/src/features/messages/dtos/SendMessageDTO";

export class SocketMessageHandler {
  constructor(private readonly sendMessageUseCase: SendMessageUseCase) {}

  /**
   * Gère la connexion d'un client Socket.io
   * @param socket Le socket du client
   */
  handleConnection(socket: Socket): void {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Événement: envoi de message
    socket.on("send_message", (data: SendMessageDTO) => {
      try {
        this.handleSendMessage(socket, data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Socket Error] ${socket.id}:`, message);
        socket.emit("error", { message });
      }
    });

    // Événement: déconnexion
    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });

    // Gestion des erreurs de socket
    socket.on("error", (error: any) => {
      console.error(`[Socket Error] ${socket.id}:`, error);
    });
  }

  /**
   * Traite l'envoi d'un message
   * @param socket Le socket du client
   * @param data Les données du message
   */
  private handleSendMessage(socket: Socket, data: SendMessageDTO): void {
    // Validation
    if (!data.userId || !data.content) {
      throw new Error("userId and content are required");
    }

    // Exécute le use case
    const result = this.sendMessageUseCase.execute(data);

    // Log
    console.log(`[Message] New message from ${result.userId}: ${result.content}`);

    // ✅ Broadcast à TOUS les clients (incluant le sender)
    socket.broadcast.emit("receive_message", {
      id: result.id,
      userId: result.userId,
      content: result.content,
      timestamp: result.timestamp,
    });

    // ✅ Aussi envoyer au sender pour confirmation
    socket.emit("receive_message", {
      id: result.id,
      userId: result.userId,
      content: result.content,
      timestamp: result.timestamp,
    });
  }
}
