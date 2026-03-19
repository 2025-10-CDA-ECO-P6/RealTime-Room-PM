import { SocketPublisher } from "./features/messages/services/SocketPublisher";
import { Server } from "socket.io";
import { SocketServer } from "./features/messages/services/SocketServer";
import { ISocketServer } from "./features/messages/interface/ISocketServer";
import { DIContainer } from "@repo/di";
import {
  IClock,
  IMessagePublisher,
  IRandomChoicePolicy,
  ITurnRepository,
  ITurnStatePublisher,
} from "@repo/backend-domain";
import { InMemoryTurnRepository, SystemClock, RandomChoicePolicy, SocketTurnPublisher } from "./features";

export function registerInfrastructureServices(container: DIContainer, socketIOServer?: Server): void {
  if (socketIOServer) {
    container.singleton<IMessagePublisher>("MessagePublisher", () => new SocketPublisher(socketIOServer));
    container.singleton<ITurnStatePublisher>("TurnStatePublisher", () => new SocketTurnPublisher(socketIOServer));
  }

  container.singleton<ISocketServer>("SocketServer", () => new SocketServer());
  container.singleton<ITurnRepository>("TurnRepository", () => new InMemoryTurnRepository());
  container.singleton<IClock>("Clock", () => new SystemClock());
  container.singleton<IRandomChoicePolicy>("RandomChoicePolicy", () => new RandomChoicePolicy());
}
