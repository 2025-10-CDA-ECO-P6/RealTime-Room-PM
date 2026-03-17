import { DIContainer } from "@repo/di/src/DIContainer";
import { ChatService } from "./features/messages/services/ChatService";

export function registerDomainServices(container: DIContainer): void {

  container.singleton("ChatService", (_c: DIContainer) => {
    return new ChatService();
  });

}
