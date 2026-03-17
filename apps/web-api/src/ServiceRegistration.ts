import { SendMessageUseCase } from "packages/backend/application/src/features/messages/use-cases/SendMessageUseCase";
import { IMessagePublisher } from "packages/backend/domain/src/features/messages/interfaces/IMessagePublisher";
import { IChatService } from "packages/backend/domain/src/features/messages/services/IChatService";
import { SocketPublisher } from "packages/backend/infrastructure/src/services/SocketPublisher";
import { DIContainer } from "packages/shared/di/src/DIContainer";
import { SocketMessageHandler } from "./features/messages/socket/SocketMessageHandler";
import { Server as SocketIOServer } from "socket.io";
import { MessageController } from "./features/messages/controllers/MessageController";

export function registerWebApiServices(container: DIContainer, socketIOServer: SocketIOServer): void {

  container.singleton("MessagePublisher", () => {
    return new SocketPublisher(socketIOServer);
  });

  container.scoped("SendMessageUseCase", (container: DIContainer) => {
    const chatService = container.inject<IChatService>("ChatService");
    const messagePublisher = container.inject<IMessagePublisher>("MessagePublisher");
    return new SendMessageUseCase(chatService, messagePublisher);
  });

  container.scoped("MessageController", (container: DIContainer) => {
    const sendMessageUseCase = container.inject<SendMessageUseCase>("SendMessageUseCase");
    return new MessageController(sendMessageUseCase);
  });


  container.singleton("SocketMessageHandler", (container
    : DIContainer) => {
    const sendMessageUseCase = container.inject<SendMessageUseCase>("SendMessageUseCase");
    return new SocketMessageHandler(sendMessageUseCase);
  });
}
