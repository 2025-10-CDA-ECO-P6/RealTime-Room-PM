import { RequestMessageDTO } from "../dtos/RequestMessageDTO";
import { ResponseMessageDTO } from "../dtos/ResponseMessageDTO";

export interface ISendMessageUseCase {
  execute(roomId: string, dto: RequestMessageDTO): ResponseMessageDTO;
}
