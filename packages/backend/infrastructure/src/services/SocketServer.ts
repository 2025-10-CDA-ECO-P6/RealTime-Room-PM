import { SendMessageDTO } from "@repo/backend-application/src/features/messages/dtos/SendMessageDTO";
import { ISendMessageUseCase } from "@repo/backend-application/src/features/messages/use-cases/ISendMessageUseCase";
import { Server, Socket } from "socket.io";

export class SocketServer {
  private useCase!: ISendMessageUseCase;

  constructor(private readonly io: Server) {}

  setUseCase(useCase: ISendMessageUseCase) {
    this.useCase = useCase;
  }

  start() {
    this.io.on("connection", (socket: Socket) => {
      socket.on("send_message", (data: SendMessageDTO) => {
        this.useCase.execute(data);
      });
    });
  }
}