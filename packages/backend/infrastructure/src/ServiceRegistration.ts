import { SocketMessagePublisher } from "./features/messages/services/SocketMessagePublisher";
import { Server } from "socket.io";

import { DIContainer } from "@repo/di";
import {
  IClock,
  IMessagePublisher,
  IRandomChoicePolicy,
  ITurnRepository,
  ITurnStatePublisher,
} from "@repo/backend-domain";
import { InMemoryTurnRepository, SystemClock, RandomChoicePolicy, SocketTurnPublisher } from "./features";
import { InMemorySocketPresenceStore, ISocketPresenceStore, ISocketServer, SocketIOServerAdapter } from "./core";

export function registerInfrastructureServices(container: DIContainer, socketIOServer?: Server): void {
  if (!socketIOServer) {
    throw new Error("socketIOServer is required");
  }

  container.singleton<ISocketServer>("SocketServer", () => new SocketIOServerAdapter(socketIOServer));
  container.singleton<ISocketPresenceStore>("SocketPresenceStore", () => new InMemorySocketPresenceStore());

  container.singleton<IMessagePublisher>("MessagePublisher", (c: DIContainer) => {
    return new SocketMessagePublisher(c.inject<ISocketServer>("SocketServer"));
  });

  container.singleton<ITurnStatePublisher>("TurnStatePublisher", (c: DIContainer) => {
    return new SocketTurnPublisher(c.inject<ISocketServer>("SocketServer"));
  });

  container.singleton<ITurnRepository>("TurnRepository", () => new InMemoryTurnRepository());
  container.singleton<IClock>("Clock", () => new SystemClock());
  container.singleton<IRandomChoicePolicy>("RandomChoicePolicy", () => new RandomChoicePolicy());
}
