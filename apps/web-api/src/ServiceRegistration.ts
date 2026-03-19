import { SocketMessageAdapter } from "./features/messages/socket/SocketMessageAdapter";
import { Server as SocketIOServer } from "socket.io";

import { ISocketMessageAdapter } from "./features/messages/interface/ISocketMessageHandler";
import { IMessagePublisher } from "@repo/backend-domain";
import { DIContainer } from "@repo/di";
import { ISocketServer, SocketPublisher } from "@repo/backend-infrastructure";
import { ISendMessageUseCase } from "@repo/backend-application";

export function registerWebApiServices(container: DIContainer, socketIOServer: SocketIOServer): void {
  container.singleton<IMessagePublisher>("MessagePublisher", () => new SocketPublisher(socketIOServer));

  container.singleton<ISocketMessageAdapter>("SocketMessageHandler", (c: DIContainer) => {
    const socketServer = c.inject<ISocketServer>("SocketServer");
    const sendMessageUseCase = c.inject<ISendMessageUseCase>("SendMessageUseCase");
    return new SocketMessageAdapter(socketServer, sendMessageUseCase);
  });
}
