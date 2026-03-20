import { ISocketConnection, ISocketModule, ISocketPresenceStore, ISocketServer } from "@repo/backend-infrastructure";
import { ISendMessageUseCase } from "@repo/backend-application";
import { RoomId, UserId, UserName } from "@repo/backend-domain";
import { JoinRoomPayload, SendMessagePayload } from "../types/type";

export class MessageSocketModule implements ISocketModule {
  constructor(
    private readonly socketServer: ISocketServer,
    private readonly socketPresenceStore: ISocketPresenceStore,
    private readonly sendMessageUseCase: ISendMessageUseCase,
  ) {}

  register(): void {
    this.socketServer.onConnection((connection: ISocketConnection) => {
      connection.on("join_room", (payload: unknown) => {
        this.handleJoinRoom(connection, payload);
      });

      connection.on("send_message", (payload: unknown) => {
        this.handleSendMessage(connection, payload);
      });

      connection.on("leave_room", () => {
        this.handleLeaveRoom(connection);
      });

      connection.on("disconnect", () => {
        this.handleDisconnect(connection);
      });
    });
  }

  private handleJoinRoom(connection: ISocketConnection, payload: unknown): void {
    try {
      const currentContext = connection.getContext();

      if (currentContext.roomId && currentContext.userId && currentContext.userName) {
        connection.leaveRoom(currentContext.roomId);
        this.handleConnectionExit(connection, "leave_room");
      }

      const data = payload as JoinRoomPayload;

      const roomId = RoomId.create(data.roomId);
      const userId = UserId.create(data.userId);
      const userName = UserName.create(data.userName);

      connection.joinRoom(roomId.value);
      connection.setContext({
        roomId: roomId.value,
        userId: userId.value,
        userName: userName.value,
      });

      const addResult = this.socketPresenceStore.addConnection(
        roomId.value,
        userId.value,
        userName.value,
        connection.id,
      );

      connection.emit("room_joined", {
        roomId: roomId.value,
        userId: userId.value,
        userName: userName.value,
        userCount: addResult.userCount,
        roomLink: `http://localhost:3000?room=${roomId.value}`,
      });

      if (addResult.isNewUserInRoom) {
        this.socketServer.emitToRoom(roomId.value, "user_joined", {
          userId: userId.value,
          userName: userName.value,
          socketId: connection.id,
          userCount: addResult.userCount,
        });
      }

      console.log(
        `[MessageSocketModule] User ${userName.value} (${userId.value}) joined room ${roomId.value} (${addResult.userCount} users, isNewUserInRoom=${addResult.isNewUserInRoom})`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid join_room payload";
      connection.emit("error", { message });
    }
  }

  private handleSendMessage(connection: ISocketConnection, payload: unknown): void {
    try {
      const data = payload as SendMessagePayload;
      const context = connection.getContext();

      if (!context.roomId || !context.userId || !context.userName) {
        connection.emit("error", { message: "Not in a room" });
        return;
      }

      if (!data?.content || typeof data.content !== "string") {
        connection.emit("error", { message: "content is required" });
        return;
      }

      this.sendMessageUseCase.execute(context.roomId, {
        userId: context.userId,
        userName: context.userName,
        content: data.content,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[MessageSocketModule] send_message error:", message);
      connection.emit("error", { message });
    }
  }

  private handleLeaveRoom(connection: ISocketConnection): void {
    const context = connection.getContext();

    if (!context.roomId) {
      return;
    }

    connection.leaveRoom(context.roomId);
    this.handleConnectionExit(connection, "leave_room");
  }

  private handleDisconnect(connection: ISocketConnection): void {
    this.handleConnectionExit(connection, "disconnect");
  }

  private handleConnectionExit(connection: ISocketConnection, reason: "leave_room" | "disconnect"): void {
    const context = connection.getContext();

    if (!context.roomId || !context.userId || !context.userName) {
      return;
    }

    const removeResult = this.socketPresenceStore.removeConnection(context.roomId, context.userId, connection.id);

    if (removeResult.didUserLeaveRoom) {
      this.socketServer.emitToRoom(context.roomId, "user_left", {
        userId: context.userId,
        userName: context.userName,
        socketId: connection.id,
        userCount: removeResult.userCount,
        reason,
      });
    }

    console.log(
      `[MessageSocketModule] User ${context.userName} (${context.userId}) left room ${context.roomId} (${removeResult.userCount} users, didUserLeaveRoom=${removeResult.didUserLeaveRoom}, reason=${reason})`,
    );

    this.clearConnectionContext(connection);
  }

  private clearConnectionContext(connection: ISocketConnection): void {
    connection.setContext({
      roomId: undefined,
      userId: undefined,
      userName: undefined,
    });
  }
}
