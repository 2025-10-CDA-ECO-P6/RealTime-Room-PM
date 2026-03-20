export interface ITurnScheduler {
  schedule(roomId: string, runAt: Date): Promise<void>;
  cancel(roomId: string): Promise<void>;
}
