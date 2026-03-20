import { ITurnRepository, Turn } from "@repo/backend-domain";

export class InMemoryTurnRepository implements ITurnRepository {
  private readonly turnsById = new Map<string, Turn>();
  private readonly currentTurnIdByRoomId = new Map<string, string>();

  async save(turn: Turn): Promise<void> {
    this.turnsById.set(turn.id.value, turn);

    if (!turn.isClosed()) {
      this.currentTurnIdByRoomId.set(turn.roomId.value, turn.id.value);
      return;
    }

    const currentTurnId = this.currentTurnIdByRoomId.get(turn.roomId.value);

    if (currentTurnId === turn.id.value) {
      this.currentTurnIdByRoomId.delete(turn.roomId.value);
    }
  }

  async getById(turnId: string): Promise<Turn | null> {
    return this.turnsById.get(turnId) ?? null;
  }

  async getCurrentByRoomId(roomId: string): Promise<Turn | null> {
    const turnId = this.currentTurnIdByRoomId.get(roomId);

    if (!turnId) {
      return null;
    }

    return this.turnsById.get(turnId) ?? null;
  }
}