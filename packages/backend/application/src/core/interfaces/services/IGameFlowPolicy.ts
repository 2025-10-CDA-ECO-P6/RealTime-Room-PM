export interface IGameFlowPolicy {
  shouldContinue(params: {
    roomId: string;
    previousTurnNumber: number;
    previousResolution: {
      selectedActionId: string | null;
      reason: "absolute-majority" | "all-voted" | "decision-timeout" | "finalization-timeout";
      isTie: boolean;
      resolvedAt: Date;
    };
    presentPlayerIds: string[];
    now: Date;
  }): Promise<boolean> | boolean;

  getNextTurnNumber(previousTurnNumber: number): number;
}
