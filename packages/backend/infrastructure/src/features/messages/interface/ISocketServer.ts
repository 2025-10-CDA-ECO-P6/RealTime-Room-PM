import { Socket } from "socket.io";
import { JoinRoomHandler, LeaveRoomHandler, MessageHandler } from "../types/types";

export interface ISocketServer {
  setMessageHandler(handler: MessageHandler): void;
  setJoinRoomHandler(handler: JoinRoomHandler): void;
  setLeaveRoomHandler(handler: LeaveRoomHandler): void;
  handleConnection(socket: Socket): void;
}