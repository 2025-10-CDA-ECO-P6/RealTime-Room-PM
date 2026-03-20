import { ISocketServer, ISocketPresenceStore } from "@repo/backend-infrastructure";
import { DIContainer } from "@repo/di";
import { MessageSocketModule } from "./features/messages/socket/MessageSocketModule";
import { RpgTurnSocketModule } from "./features/rpg/socket/RpgTurnSocketModule";
import {
  IJoinTurnPlayerUseCase,
  ILeaveTurnPlayerUseCase,
  ISendMessageUseCase,
  IStartGameUseCase,
  ISubmitVoteUseCase,
  ITickTurnUseCase,
} from "@repo/backend-application";

export function registerWebApiServices(container: DIContainer): void {
   container.singleton<MessageSocketModule>("MessageSocketModule", (c: DIContainer) => {
    return new MessageSocketModule(
      c.inject<ISocketServer>("SocketServer"),
      c.inject<ISocketPresenceStore>("SocketPresenceStore"),
      c.inject<ISendMessageUseCase>("SendMessageUseCase"),
    );
  });

  container.singleton<RpgTurnSocketModule>("RpgTurnSocketModule", (c: DIContainer) => {
    return new RpgTurnSocketModule(
      c.inject<ISocketServer>("SocketServer"),
      c.inject<IStartGameUseCase>("StartGameUseCase"),
      c.inject<ISubmitVoteUseCase>("SubmitVoteUseCase"),
      c.inject<IJoinTurnPlayerUseCase>("JoinTurnPlayerUseCase"),
      c.inject<ILeaveTurnPlayerUseCase>("LeaveTurnPlayerUseCase"),
      c.inject<ITickTurnUseCase>("TickTurnUseCase"),
    );
  });
}
