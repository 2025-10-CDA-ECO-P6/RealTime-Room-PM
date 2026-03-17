import { SocketPublisher } from "./features/messages/services/SocketPublisher";
import { Server } from "socket.io";
import { SocketServer } from "./features/messages/services/SocketServer";
import { ISocketServer } from "./features/messages/interface/ISocketServer";
import { DIContainer } from "@repo/di";
import { IMessagePublisher } from "@repo/backend-domain";


export function registerInfrastructureServices(container: DIContainer, socketIOServer?: Server): void {
  if (socketIOServer) {
    container.singleton<IMessagePublisher>("MessagePublisher", () => new SocketPublisher(socketIOServer));
  }

  container.singleton<ISocketServer>("SocketServer", () => new SocketServer());
}