import { ResponseMessageDTO } from "../dtos/ResponseMessageDTO";
import { RequestMessageDTO } from "../dtos/RequestMessageDTO";
import { ISendMessageUseCase } from "../interfaces/ISendMessageUseCase";
import { IMessagePublisher, RoomId, UserId, MessageContent, Message } from "@repo/backend-domain";

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(private readonly messagePublisher: IMessagePublisher) {}

  execute(roomId: string, dto: RequestMessageDTO): ResponseMessageDTO {
    const room = RoomId.create(roomId);
    const user = UserId.create(dto.userId);
    const content = MessageContent.create(dto.content);

    const message = Message.create(user, content);

    this.messagePublisher.publishMessage(room, message);

    return {
      id: message.id.value,
      userId: message.userId.value,
      content: message.content.value,
      timestamp: message.timestamp,
    };
  }
}
