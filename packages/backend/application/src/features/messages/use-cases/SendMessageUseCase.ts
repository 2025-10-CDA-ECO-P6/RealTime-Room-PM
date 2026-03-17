import { IChatService } from "@repo/backend-domain/src/features/messages/services/IChatService";
import { MessageDTO } from "../dtos/MessageDTO";
import { SendMessageDTO } from "../dtos/SendMessageDTO";
import { ISendMessageUseCase } from "./ISendMessageUseCase";
import { IMessagePublisher } from "@repo/backend-domain/src/features/messages/interfaces/IMessagePublisher";

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private readonly chatService: IChatService,
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  execute(dto: SendMessageDTO): MessageDTO {
    const message = this.chatService.addMessage(dto.userId, dto.content);

    this.messagePublisher.publishMessage(message);

    return {
      id: message.id,
      userId: message.userId,
      content: message.content,
      timestamp: message.timestamp,
    };
  }
}
 