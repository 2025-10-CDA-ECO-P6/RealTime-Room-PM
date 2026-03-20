export interface ITurnTimingPolicy {
  getDecisionDurationMs(params: { roomId: string; turnNumber: number }): number;

  getFinalizationDurationMs(params: { roomId: string; turnNumber: number }): number;
}
