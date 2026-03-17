import { MessageHandler, JoinRoomHandler, LeaveRoomHandler } from "../types/types";
import { ISocketServer } from "../interface/ISocketServer";
import { Socket } from "socket.io";
import { SocketData } from "../types/SocketData";
import { RoomId, UserId } from "@repo/backend-domain";

export class SocketServer implements ISocketServer {
  private readonly roomUsers: Map<string, Set<string>> = new Map();
  private messageHandler?: MessageHandler;
  private joinRoomHandler?: JoinRoomHandler;
  private leaveRoomHandler?: LeaveRoomHandler;

  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  setJoinRoomHandler(handler: JoinRoomHandler): void {
    this.joinRoomHandler = handler;
  }

  setLeaveRoomHandler(handler: LeaveRoomHandler): void {
    this.leaveRoomHandler = handler;
  }

  private getOrCreateRoom(roomId: string): Set<string> {
    const room = this.roomUsers.get(roomId);
    if (room) {
      return room;
    }

    const newRoom = new Set<string>();
    this.roomUsers.set(roomId, newRoom);
    return newRoom;
  }

  private addUserToRoom(roomId: string, userId: string): number {
    const room = this.getOrCreateRoom(roomId);
    room.add(userId);
    return room.size;
  }

  private removeUserFromRoom(roomId: string, userId: string): number {
    const room = this.roomUsers.get(roomId);
    if (!room) return 0;

    room.delete(userId);
    if (room.size === 0) {
      this.roomUsers.delete(roomId);
    }
    return room.size;
  }

  handleConnection(socket: Socket): void {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("join_room", (data: { roomId: string; userId: string }) => {
      try {
        const roomId = RoomId.create(data.roomId);
        const userId = UserId.create(data.userId);

        socket.join(`room_${roomId.value}`);
        socket.data = { roomId, userId } as SocketData;

        const userCount = this.addUserToRoom(roomId.value, userId.value);

        console.log(`[Socket] User ${userId.value} joined room ${roomId.value} (${userCount} users)`);

        socket.broadcast.to(`room_${roomId.value}`).emit("user_joined", {
          userId: userId.value,
          socketId: socket.id,
          userCount,
        });

        this.joinRoomHandler?.(roomId.value, userId.value);

        socket.emit("room_joined", {
          roomId: roomId.value,
          userId: userId.value,
          userCount,
          roomLink: `http://localhost:3000?room=${roomId.value}`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid roomId or userId";
        socket.emit("error", { message });
      }
    });

    socket.on("send_message", (data: { userId: string; content: string }) => {
      try {
        const socketData = socket.data as SocketData;

        if (!socketData?.roomId || !socketData?.userId) {
          socket.emit("error", { message: "Not in a room" });
          return;
        }

        if (!data.userId || !data.content) {
          socket.emit("error", { message: "userId and content are required" });
          return;
        }

        console.log(`[SocketServer] send_message event received for room ${socketData.roomId.value}`);
        this.messageHandler?.(socketData.roomId.value, data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Socket Error] ${socket.id}:`, message);
        socket.emit("error", { message });
      }
    });

    socket.on("leave_room", () => {
      const socketData = socket.data as SocketData;

      if (socketData?.roomId && socketData?.userId) {
        const userCount = this.removeUserFromRoom(socketData.roomId.value, socketData.userId.value);

        socket.leave(`room_${socketData.roomId.value}`);

        socket.broadcast.to(`room_${socketData.roomId.value}`).emit("user_left", {
          userId: socketData.userId.value,
          socketId: socket.id,
          userCount,
        });

        this.leaveRoomHandler?.(socketData.roomId.value, socketData.userId.value);

        console.log(
          `[Socket] User ${socketData.userId.value} left room ${socketData.roomId.value} (${userCount} users)`,
        );
      }
    });

    socket.on("disconnect", () => {
      const socketData = socket.data as SocketData;
      if (socketData?.roomId && socketData?.userId) {
        const userCount = this.removeUserFromRoom(socketData.roomId.value, socketData.userId.value);

        socket.broadcast.to(`room_${socketData.roomId.value}`).emit("user_left", {
          userId: socketData.userId.value,
          socketId: socket.id,
          userCount,
        });
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });

    socket.on("error", (error: any) => {
      console.error(`[Socket Error] ${socket.id}:`, error);
    });
  }
}
