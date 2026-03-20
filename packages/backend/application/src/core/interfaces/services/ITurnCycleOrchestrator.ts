export interface ITurnCycleOrchestrator {
  onTurnStateChanged(roomId: string): Promise<void>;
  tick(roomId: string): Promise<void>;
  startGame(roomId: string): Promise<void>;
  stopGame(roomId: string): Promise<void>;
}
