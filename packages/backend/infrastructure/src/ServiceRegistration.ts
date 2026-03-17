import { DIContainer } from "@repo/di/src/DIContainer";
import { SocketPublisher } from "./services/SocketPublisher";
import { Server } from "socket.io";

export function registerInfrastructureServices(container: DIContainer, socketIOServer?: Server): void {

  if (socketIOServer) {
    container.singleton("MessagePublisher", (_c: DIContainer) => {
      return new SocketPublisher(socketIOServer);
    });
  }
}
