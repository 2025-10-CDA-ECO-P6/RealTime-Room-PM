import { SendMessageUseCase } from "./features/messages/use-cases/SendMessageUseCase";
import { ISendMessageUseCase } from "./features/messages/interfaces/ISendMessageUseCase";
import { IMessagePublisher } from "@repo/backend-domain";
import { DIContainer } from "@repo/di";

export function registerApplicationServices(container: DIContainer): void {
  container.scoped<ISendMessageUseCase>("SendMessageUseCase", (c: DIContainer) => {
    const messagePublisher = c.inject<IMessagePublisher>("MessagePublisher");
    return new SendMessageUseCase(messagePublisher);
  });
}
