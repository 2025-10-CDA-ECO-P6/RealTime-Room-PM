import { ISocketPresenceStore } from "../interfaces/ISocketPresenceStore";
import { RoomPresence, ConnectedUserPresence, RemoveConnectionResult } from "../types";
import { AddConnectionResult } from "../types/AddConnectionResult";

export class InMemorySocketPresenceStore implements ISocketPresenceStore {
  private readonly roomUsers = new Map<string, RoomPresence>();

  private getOrCreateRoom(roomId: string): RoomPresence {
    const room = this.roomUsers.get(roomId);

    if (room) {
      return room;
    }

    const nextRoom: RoomPresence = new Map();
    this.roomUsers.set(roomId, nextRoom);
    return nextRoom;
  }

  addConnection(roomId: string, userId: string, userName: string, socketId: string): AddConnectionResult {
    const room = this.getOrCreateRoom(roomId);
    const existing = room.get(userId);

    if (existing) {
      existing.userName = userName;
      existing.socketIds.add(socketId);

      return {
        userCount: room.size,
        isNewUserInRoom: false,
      };
    }

    const presence: ConnectedUserPresence = {
      userName,
      socketIds: new Set([socketId]),
    };

    room.set(userId, presence);

    return {
      userCount: room.size,
      isNewUserInRoom: true,
    };
  }

  removeConnection(roomId: string, userId: string, socketId: string): RemoveConnectionResult {
    const room = this.roomUsers.get(roomId);

    if (!room) {
      return {
        userCount: 0,
        didUserLeaveRoom: false,
      };
    }

    const existing = room.get(userId);

    if (!existing) {
      return {
        userCount: room.size,
        didUserLeaveRoom: false,
      };
    }

    existing.socketIds.delete(socketId);

    if (existing.socketIds.size > 0) {
      return {
        userCount: room.size,
        didUserLeaveRoom: false,
      };
    }

    room.delete(userId);

    if (room.size === 0) {
      this.roomUsers.delete(roomId);

      return {
        userCount: 0,
        didUserLeaveRoom: true,
      };
    }

    return {
      userCount: room.size,
      didUserLeaveRoom: true,
    };
  }

  getUserName(roomId: string, userId: string): string | null {
    const room = this.roomUsers.get(roomId);

    if (!room) {
      return null;
    }

    return room.get(userId)?.userName ?? null;
  }

  getUserIds(roomId: string): string[] {
    const room = this.roomUsers.get(roomId);

    if (!room) {
      return [];
    }

    return [...room.keys()];
  }

  hasUser(roomId: string, userId: string): boolean {
    return this.roomUsers.get(roomId)?.has(userId) ?? false;
  }
}