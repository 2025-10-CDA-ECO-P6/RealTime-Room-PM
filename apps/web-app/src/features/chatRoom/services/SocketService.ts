import { io, Socket } from "socket.io-client";
import { loggerService } from "../../../core/services";
import type { CurrentUser } from "../../common/types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
interface SocketServiceConfig {
  url?: string;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
}

export interface RoomJoinedData {
  roomId: string;
  userId: string;
  userName: string;
  userCount: number;
  roomLink: string;
}

export interface UserJoinedData {
  userId: string;
  userName: string;
  userCount: number;
}

export interface UserLeftData {
  userId: string;
  userName: string;
  userCount: number;
}

export interface MessageReceivedData {
  userId: string;
  userName: string;
  content: string;
}

export interface SocketService {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: () => boolean;

  joinRoom: (roomId: string, user: CurrentUser) => void;
  leaveRoom: () => void;
  sendMessage: (roomId: string, user: CurrentUser, content: string) => void;

  onConnect: (callback: () => void) => void;
  onDisconnect: (callback: (reason: string) => void) => void;
  onError: (callback: (error: unknown) => void) => void;

  onMessageReceived: (callback: (data: MessageReceivedData) => void) => void;
  onRoomJoined: (callback: (data: RoomJoinedData) => void) => void;
  onUserJoined: (callback: (data: UserJoinedData) => void) => void;
  onUserLeft: (callback: (data: UserLeftData) => void) => void;
}

class SocketIOService implements SocketService {
  private socket: Socket | null = null;
  private readonly config: Required<SocketServiceConfig>;
  private readonly listeners: Map<string, Array<(data?: unknown) => void>> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;

  constructor(config: SocketServiceConfig = {}) {
    this.config = {
      url: config.url || SERVER_URL,
      reconnection: config.reconnection ?? true,
      reconnectionDelay: config.reconnectionDelay ?? 1000,
      reconnectionDelayMax: config.reconnectionDelayMax ?? 5000,
      reconnectionAttempts: config.reconnectionAttempts ?? 5,
    };
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    if (this.connectionPromise !== null) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const socket = io(this.config.url, {
          reconnection: this.config.reconnection,
          reconnectionDelay: this.config.reconnectionDelay,
          reconnectionDelayMax: this.config.reconnectionDelayMax,
          reconnectionAttempts: this.config.reconnectionAttempts,
          transports: ["websocket", "polling"],
        });

        this.socket = socket;
        this.setupListeners(socket);

        socket.once("connect", () => {
          loggerService.info("SocketIO", "Connected", { socketId: socket.id });
          this.emit("connect");
          this.connectionPromise = null;
          resolve();
        });

        socket.once("connect_error", (error) => {
          loggerService.error("SocketIO", "Connection error", error);
          this.connectionPromise = null;
          reject(error);
        });
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private setupListeners(socket: Socket): void {
    socket.on("disconnect", (reason: string) => {
      loggerService.warn("SocketIO", "Disconnected", { reason });
      this.currentRoomId = null;
      this.emit("disconnect", reason);
    });

    socket.on("error", (error: unknown) => {
      loggerService.error("SocketIO", "Socket error", error);
      this.emit("error", error);
    });

    socket.on("message_received", (data: MessageReceivedData) => {
      this.emit("messageReceived", data);
    });

    socket.on("room_joined", (data: RoomJoinedData) => {
      this.currentRoomId = data.roomId;
      this.currentUserId = data.userId;
      this.emit("roomJoined", data);
    });

    socket.on("user_joined", (data: UserJoinedData) => {
      this.emit("userJoined", data);
    });

    socket.on("user_left", (data: UserLeftData) => {
      this.emit("userLeft", data);
    });
  }

  private emit(eventName: string, data?: unknown): void {
    const callbacks = this.listeners.get(eventName) || [];
    callbacks.forEach((callback) => callback(data));
  }

  private on(eventName: string, callback: (data?: unknown) => void): void {
    const current = this.listeners.get(eventName) || [];
    this.listeners.set(eventName, [...current, callback]);
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.connectionPromise = null;
    this.currentRoomId = null;
    this.currentUserId = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  joinRoom(roomId: string, user: CurrentUser): void {
    if (!this.socket?.connected) {
      loggerService.warn("SocketIO", "Socket not connected");
      return;
    }

    if (this.currentRoomId === roomId && this.currentUserId === user.userId) {
      return;
    }

    this.socket.emit("join_room", {
      roomId,
      userId: user.userId,
      userName: user.userName,
    });
  }

  leaveRoom(): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("leave_room");
    this.currentRoomId = null;
  }

  sendMessage(roomId: string, user: CurrentUser, content: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("send_message", {
      roomId,
      userId: user.userId,
      userName: user.userName,
      content,
    });
  }

  onConnect(callback: () => void): void {
    this.on("connect", callback);
  }

  onDisconnect(callback: (reason: string) => void): void {
    this.on("disconnect", (data) => callback((data as string) ?? ""));
  }

  onError(callback: (error: unknown) => void): void {
    this.on("error", callback);
  }

  onMessageReceived(callback: (data: MessageReceivedData) => void): void {
    this.on("messageReceived", (data) => callback(data as MessageReceivedData));
  }

  onRoomJoined(callback: (data: RoomJoinedData) => void): void {
    this.on("roomJoined", (data) => callback(data as RoomJoinedData));
  }

  onUserJoined(callback: (data: UserJoinedData) => void): void {
    this.on("userJoined", (data) => callback(data as UserJoinedData));
  }

  onUserLeft(callback: (data: UserLeftData) => void): void {
    this.on("userLeft", (data) => callback(data as UserLeftData));
  }
}

let socketServiceInstance: SocketService | null = null;

export function initSocketService(config?: SocketServiceConfig): SocketService {
  socketServiceInstance ??= new SocketIOService(config);
  return socketServiceInstance;
}

export function getSocketService(): SocketService {
  socketServiceInstance ??= new SocketIOService();
  return socketServiceInstance;
}