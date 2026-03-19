import { ISocketServer } from "@repo/backend-infrastructure";
import { ISocketMessageAdapter } from "../interface/ISocketMessageHandler";
import { ISendMessageUseCase } from "@repo/backend-application";

export class SocketMessageAdapter implements ISocketMessageAdapter {
  constructor(
    private readonly socketServer: ISocketServer,
    private readonly sendMessageUseCase: ISendMessageUseCase,
  ) {}

  private setupHandlers(): void {
    this.socketServer.setJoinRoomHandler((roomId: string, userId: string, userName: string) => {
      console.log(`[Handler] User ${userName} (${userId}) attempting to join room ${roomId}`);
      return { roomLink: `http://localhost:3000?room=${roomId}` };
    });

    this.socketServer.setMessageHandler(
      (roomId: string, data: { userId: string; userName: string; content: string }) => {
        try {
          console.log(`[Handler] Processing message in room ${roomId}:`, data);

          this.sendMessageUseCase.execute(roomId, {
            userId: data.userId,
            userName: data.userName,
            content: data.content,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(`[Handler Error]:`, message);
        }
      },
    );

    this.socketServer.setLeaveRoomHandler((roomId: string, userId: string, userName: string) => {
      console.log(`[Handler] User ${userName} (${userId}) left room ${roomId}`);
    });
  }

  start(): void {
    this.setupHandlers();
  }
}
