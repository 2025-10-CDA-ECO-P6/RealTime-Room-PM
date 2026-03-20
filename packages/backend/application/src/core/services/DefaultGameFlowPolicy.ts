import { IGameFlowPolicy } from "../interfaces";
import { DefaultGameFlowPolicyOptions } from "../types";

export class DefaultGameFlowPolicy implements IGameFlowPolicy {
  private readonly maxTurns: number | null;
  private readonly decisionDurationMs: number;

  constructor(options: DefaultGameFlowPolicyOptions) {
    if (options.decisionDurationMs <= 0) {
      throw new Error("decisionDurationMs must be greater than 0");
    }

    this.maxTurns = options.maxTurns ?? null;
    this.decisionDurationMs = options.decisionDurationMs;
  }

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
  }): boolean {
    if (params.presentPlayerIds.length === 0) {
      return false;
    }

    if (this.maxTurns !== null && params.previousTurnNumber >= this.maxTurns) {
      return false;
    }

    return true;
  }

  getNextTurnNumber(previousTurnNumber: number): number {
    return previousTurnNumber + 1;
  }

  getDecisionDurationMs(_params: { roomId: string; turnNumber: number }): number {
    return this.decisionDurationMs;
  }
}
