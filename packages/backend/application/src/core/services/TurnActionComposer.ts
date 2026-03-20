import { ITurnActionComposer, ITurnActionRegistry } from "../interfaces";
import { TurnActionDefinition } from "../types";

export class TurnActionComposer implements ITurnActionComposer {
  constructor(private readonly turnActionRegistry: ITurnActionRegistry) {}

  async compose(params: {
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
    const providers = this.turnActionRegistry.getProviders();

    const actionGroups = await Promise.all(providers.map((provider) => provider.getAvailableActions(params)));

    return actionGroups.flat().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }
}
