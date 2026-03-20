import { ITurnActionResolver } from "@repo/backend-application";

export class DefaultRpgTurnActionResolver implements ITurnActionResolver {
  private readonly supportedActions = new Set(["attack", "defend", "heal"]);

  canResolve(actionId: string): boolean {
    return this.supportedActions.has(actionId);
  }

  async resolve(params: {
    roomId: string;
    turnNumber: number;
    actionId: string;
    presentPlayerIds: string[];
    resolvedAt: Date;
  }): Promise<void> {
    console.log("[DefaultRpgTurnActionResolver] Resolving action", {
      roomId: params.roomId,
      turnNumber: params.turnNumber,
      actionId: params.actionId,
      presentPlayerIds: params.presentPlayerIds,
      resolvedAt: params.resolvedAt,
    });

    // TODO:
  }
}
