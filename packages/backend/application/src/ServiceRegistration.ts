import { SendMessageUseCase } from './features/messages/use-cases/SendMessageUseCase';
import { IChatService } from '@repo/backend-domain/src/features/messages/services/IChatService';
import { IMessagePublisher } from '@repo/backend-domain/src/features/messages/interfaces/IMessagePublisher';
import { DIContainer } from '@repo/di/src/DIContainer';
 
export function registerApplicationServices(container: DIContainer): void {

  container.scoped('SendMessageUseCase', (c: DIContainer) => {
    const chatService = c.inject<IChatService>('ChatService');
    const messagePublisher = c.inject<IMessagePublisher>('MessagePublisher');
 
    return new SendMessageUseCase(chatService, messagePublisher);
  });
}