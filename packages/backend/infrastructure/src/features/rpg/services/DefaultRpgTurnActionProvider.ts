import { ITurnActionProvider, TurnActionDefinition } from "@repo/backend-application";

export class DefaultRpgTurnActionProvider implements ITurnActionProvider {
  readonly featureName = "rpg";

  async getAvailableActions(params: {
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
  }): Promise<TurnActionDefinition[]> {
    return [
      {
        id: "attack",
        label: "Attack",
        sourceFeature: this.featureName,
        description: "Deal damage to the target",
        priority: 100,
      },
      {
        id: "defend",
        label: "Defend",
        sourceFeature: this.featureName,
        description: "Reduce incoming damage",
        priority: 90,
      },
      {
        id: "heal",
        label: "Heal",
        sourceFeature: this.featureName,
        description: "Recover health points",
        priority: 80,
      },
    ];
  }
}
