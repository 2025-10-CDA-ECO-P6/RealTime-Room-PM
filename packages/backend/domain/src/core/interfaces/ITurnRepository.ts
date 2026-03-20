import { Turn } from "../models/entities";

export interface ITurnRepository {
  save(turn: Turn): Promise<void>;
  getById(turnId: string): Promise<Turn | null>;
  getCurrentByRoomId(roomId: string): Promise<Turn | null>;
}
