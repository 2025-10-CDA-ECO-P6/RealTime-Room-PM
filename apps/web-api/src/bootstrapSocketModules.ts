import { DIContainer } from "@repo/di";
import { MessageSocketModule } from "./features/messages/socket/MessageSocketModule";
import { RpgTurnSocketModule } from "./features/rpg/socket/RpgTurnSocketModule";

export function bootstrapSocketModules(container: DIContainer): void {
  const messageSocketModule = container.inject<MessageSocketModule>("MessageSocketModule");
  const rpgTurnSocketModule = container.inject<RpgTurnSocketModule>("RpgTurnSocketModule");

  messageSocketModule.register();
  rpgTurnSocketModule.register();
}
