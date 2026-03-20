import { ITurnScheduler, ITurnCycleOrchestrator } from "@repo/backend-application";

export class InMemoryTurnScheduler implements ITurnScheduler {
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private turnCycleOrchestrator: ITurnCycleOrchestrator | null = null;

  attachOrchestrator(turnCycleOrchestrator: ITurnCycleOrchestrator): void {
    this.turnCycleOrchestrator = turnCycleOrchestrator;
  }

  async schedule(roomId: string, runAt: Date): Promise<void> {
    await this.cancel(roomId);

    const delay = Math.max(0, runAt.getTime() - Date.now());

    const timer = setTimeout(async () => {
      this.timers.delete(roomId);

      if (this.turnCycleOrchestrator === null) {
        console.error(`[InMemoryTurnScheduler] No orchestrator attached for room "${roomId}"`);
        return;
      }

      try {
        await this.turnCycleOrchestrator.tick(roomId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown scheduler error";
        console.error(`[InMemoryTurnScheduler] Failed to tick room "${roomId}": ${message}`);
      }
    }, delay);

    this.timers.set(roomId, timer);
  }

  async cancel(roomId: string): Promise<void> {
    const existing = this.timers.get(roomId);

    if (!existing) {
      return;
    }

    clearTimeout(existing);
    this.timers.delete(roomId);
  }
}
