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

import {
  InMemorySocketPresenceStore,
  InMemoryTurnRepository,
  InMemoryTurnScheduler,
  ISocketPresenceStore,
  ISocketServer,
  RandomChoicePolicy,
  SocketIOServerAdapter,
  SocketTurnPublisher,
  SystemClock,
} from "./core";
import { DefaultRpgTurnActionProvider, DefaultRpgTurnActionResolver } from "./features";
import { IRoomPresenceReader, ITurnScheduler, ITurnActionProvider, ITurnActionResolver } from "@repo/backend-application";
import { SocketRoomPresenceReader } from "./core/services/SocketRoomPresenceReader";

export function registerInfrastructureServices(container: DIContainer, socketIOServer?: Server): void {
   if (!socketIOServer) {
     throw new Error("socketIOServer is required");
   }

   container.singleton<ISocketServer>("SocketServer", () => {
     return new SocketIOServerAdapter(socketIOServer);
   });

   container.singleton<ISocketPresenceStore>("SocketPresenceStore", () => {
     return new InMemorySocketPresenceStore();
   });

   container.singleton<IClock>("Clock", () => {
     return new SystemClock();
   });

   container.singleton<IRandomChoicePolicy>("RandomChoicePolicy", () => {
     return new RandomChoicePolicy();
   });

   container.singleton<ITurnRepository>("TurnRepository", () => {
     return new InMemoryTurnRepository();
   });

   container.singleton<ITurnStatePublisher>("TurnStatePublisher", (c: DIContainer) => {
     return new SocketTurnPublisher(c.inject<ISocketServer>("SocketServer"));
   });

   container.singleton<IMessagePublisher>("MessagePublisher", (c: DIContainer) => {
     return new SocketMessagePublisher(c.inject<ISocketServer>("SocketServer"));
   });

   container.singleton<IRoomPresenceReader>("RoomPresenceReader", (c: DIContainer) => {
     return new SocketRoomPresenceReader(c.inject<ISocketPresenceStore>("SocketPresenceStore"));
   });

   container.singleton<InMemoryTurnScheduler>("InMemoryTurnScheduler", () => {
     return new InMemoryTurnScheduler();
   });

   container.singleton<ITurnScheduler>("TurnScheduler", (c: DIContainer) => {
     return c.inject<InMemoryTurnScheduler>("InMemoryTurnScheduler");
   });

   container.singleton<ITurnActionProvider>("DefaultRpgTurnActionProvider", () => {
     return new DefaultRpgTurnActionProvider();
   });

   container.singleton<ITurnActionResolver>("DefaultRpgTurnActionResolver", () => {
     return new DefaultRpgTurnActionResolver();
   });
}
