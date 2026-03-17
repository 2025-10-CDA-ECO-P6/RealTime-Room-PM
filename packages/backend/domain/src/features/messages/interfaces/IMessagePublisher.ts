import { Message } from "../models/entities/Message";

export interface IMessagePublisher {
  publishMessage(message: Message): void;
}
