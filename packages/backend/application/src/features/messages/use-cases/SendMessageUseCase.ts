import { ResponseMessageDTO } from "../dtos/ResponseMessageDTO";
import { RequestMessageDTO } from "../dtos/RequestMessageDTO";
import { ISendMessageUseCase } from "../interfaces/ISendMessageUseCase";
import { IMessagePublisher, RoomId, UserId, UserName, MessageContent, Message } from "@repo/backend-domain";

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(private readonly messagePublisher: IMessagePublisher) {}

  execute(roomId: string, dto: RequestMessageDTO): ResponseMessageDTO {
    const room = RoomId.create(roomId);
    const userId = UserId.create(dto.userId);
    const userName = UserName.create(dto.userName);
    const content = MessageContent.create(dto.content);

    const message = Message.create(userId, userName, content);

    this.messagePublisher.publishMessage(room, message);

    return {
      id: message.id.value,
      userId: message.userId.value,
      userName: message.userName.value,
      content: message.content.value,
      timestamp: message.timestamp,
    };
  }
}
