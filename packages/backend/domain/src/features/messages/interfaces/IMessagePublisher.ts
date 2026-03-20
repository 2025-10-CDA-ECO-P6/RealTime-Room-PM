import { Message } from "../models/entities/Message";
import { RoomId } from "../../../core/models/value-objects/RoomId";

export interface IMessagePublisher {
  publishMessage(roomId: RoomId, message: Message): void;
}
