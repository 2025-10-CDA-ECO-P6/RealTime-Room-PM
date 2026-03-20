import { RemoveConnectionResult } from "../types";
import { AddConnectionResult } from "../types/AddConnectionResult";

export interface ISocketPresenceStore {
  addConnection(roomId: string, userId: string, userName: string, socketId: string): AddConnectionResult;
  removeConnection(roomId: string, userId: string, socketId: string): RemoveConnectionResult;
  getUserName(roomId: string, userId: string): string | null;
  getUserIds(roomId: string): string[];
  hasUser(roomId: string, userId: string): boolean;
}
