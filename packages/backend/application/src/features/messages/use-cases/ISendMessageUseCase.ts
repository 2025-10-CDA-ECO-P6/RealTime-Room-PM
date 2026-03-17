import { SendMessageDTO } from "../dtos/SendMessageDTO";
import { MessageDTO } from "../dtos/MessageDTO";

export interface ISendMessageUseCase {
  execute(dto: SendMessageDTO): MessageDTO;
}
