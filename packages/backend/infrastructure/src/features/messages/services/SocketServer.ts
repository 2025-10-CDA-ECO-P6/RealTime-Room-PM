import { MessageHandler, JoinRoomHandler, LeaveRoomHandler, RoomPresence } from "../types/types";
import { ISocketServer } from "../interface/ISocketServer";
import { Socket } from "socket.io";
import { SocketData } from "../types/SocketData";
import { RoomId, UserId } from "@repo/backend-domain";

export class SocketServer implements ISocketServer {
  private readonly roomUsers: Map<string, RoomPresence> = new Map();
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

  private getOrCreateRoom(roomId: string): RoomPresence {
    const room = this.roomUsers.get(roomId);
    if (room) {
      return room;
    }

    const newRoom: RoomPresence = new Map();
    this.roomUsers.set(roomId, newRoom);
    return newRoom;
  }

  private addSocketToRoom(roomId: string, userId: string, userName: string, socketId: string): number {
    const room = this.getOrCreateRoom(roomId);
    const existing = room.get(userId);

    if (existing) {
      existing.userName = userName;
      existing.socketIds.add(socketId);
      room.set(userId, existing);
    } else {
      room.set(userId, {
        userName,
        socketIds: new Set([socketId]),
      });
    }

    return room.size;
  }

  private removeSocketFromRoom(roomId: string, userId: string, socketId: string): number {
    const room = this.roomUsers.get(roomId);
    if (!room) {
      return 0;
    }

    const existing = room.get(userId);
    if (!existing) {
      return room.size;
    }

    existing.socketIds.delete(socketId);

    if (existing.socketIds.size === 0) {
      room.delete(userId);
    } else {
      room.set(userId, existing);
    }

    if (room.size === 0) {
      this.roomUsers.delete(roomId);
      return 0;
    }

    return room.size;
  }

  private getUserName(roomId: string, userId: string): string | null {
    const room = this.roomUsers.get(roomId);
    if (!room) {
      return null;
    }

    return room.get(userId)?.userName ?? null;
  }

  handleConnection(socket: Socket): void {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("join_room", (data: { roomId: string; userId: string; userName: string }) => {
      try {
        const roomId = RoomId.create(data.roomId);
        const userId = UserId.create(data.userId);
        const userName = data.userName?.trim();

        if (!userName) {
          socket.emit("error", { message: "userName is required" });
          return;
        }

        socket.join(`room_${roomId.value}`);
        socket.data = { roomId, userId, userName } as SocketData;

        const userCount = this.addSocketToRoom(roomId.value, userId.value, userName, socket.id);

        console.log(`[Socket] User ${userName} (${userId.value}) joined room ${roomId.value} (${userCount} users)`);

        socket.broadcast.to(`room_${roomId.value}`).emit("user_joined", {
          userId: userId.value,
          userName,
          socketId: socket.id,
          userCount,
        });

        this.joinRoomHandler?.(roomId.value, userId.value, userName);

        socket.emit("room_joined", {
          roomId: roomId.value,
          userId: userId.value,
          userName,
          userCount,
          roomLink: `http://localhost:3000?room=${roomId.value}`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid roomId or userId";
        socket.emit("error", { message });
      }
    });

    socket.on("send_message", (data: { userId: string; userName: string; content: string }) => {
      try {
        const socketData = socket.data as SocketData;

        if (!socketData?.roomId || !socketData?.userId || !socketData?.userName) {
          socket.emit("error", { message: "Not in a room" });
          return;
        }

        if (!data.userId || !data.userName || !data.content) {
          socket.emit("error", { message: "userId, userName and content are required" });
          return;
        }

        console.log(`[SocketServer] send_message event received for room ${socketData.roomId.value}`);

        this.messageHandler?.(socketData.roomId.value, {
          userId: data.userId,
          userName: data.userName,
          content: data.content,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Socket Error] ${socket.id}:`, message);
        socket.emit("error", { message });
      }
    });

    socket.on("leave_room", () => {
      const socketData = socket.data as SocketData;

      if (socketData?.roomId && socketData?.userId) {
        const userCount = this.removeSocketFromRoom(socketData.roomId.value, socketData.userId.value, socket.id);

        socket.leave(`room_${socketData.roomId.value}`);

        socket.broadcast.to(`room_${socketData.roomId.value}`).emit("user_left", {
          userId: socketData.userId.value,
          userName: socketData.userName,
          socketId: socket.id,
          userCount,
        });

        this.leaveRoomHandler?.(socketData.roomId.value, socketData.userId.value, socketData.userName);

        console.log(
          `[Socket] User ${socketData.userName} (${socketData.userId.value}) left room ${socketData.roomId.value} (${userCount} users)`,
        );
      }
    });

    socket.on("disconnect", () => {
      const socketData = socket.data as SocketData;

      if (socketData?.roomId && socketData?.userId) {
        const userCount = this.removeSocketFromRoom(socketData.roomId.value, socketData.userId.value, socket.id);

        socket.broadcast.to(`room_${socketData.roomId.value}`).emit("user_left", {
          userId: socketData.userId.value,
          userName: socketData.userName,
          socketId: socket.id,
          userCount,
        });
      }

      console.log(`[Socket] Disconnected: ${socket.id}`);
    });

    socket.on("error", (error: unknown) => {
      console.error(`[Socket Error] ${socket.id}:`, error);
    });
  }
}
