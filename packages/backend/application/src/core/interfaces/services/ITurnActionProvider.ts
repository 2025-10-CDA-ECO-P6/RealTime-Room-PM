import { TurnActionDefinition } from "../../types";

export interface ITurnActionProvider {
  readonly featureName: string;

  getAvailableActions(params: {
    roomId: string;
    turnNumber: number;
    presentPlayerIds: string[];
    previousResolution: {
      selectedActionId: string | null;
      reason: "absolute-majority" | "all-voted" | "decision-timeout" | "finalization-timeout";
      isTie: boolean;
      resolvedAt: Date;
    } | null;
    now: Date;
  }): Promise<TurnActionDefinition[]>;
}
