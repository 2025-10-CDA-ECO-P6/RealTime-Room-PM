import { ActionId } from "../value-objects";

export class TurnVote {
  constructor(
    readonly userId: string,
    readonly actionId: ActionId,
    readonly votedAt: Date,
  ) {
    if (!userId || userId.trim().length === 0) {
      throw new Error("TurnVote userId cannot be empty");
    }
  }

  static create(userId: string, actionId: ActionId, votedAt: Date): TurnVote {
    return new TurnVote(userId.trim(), actionId, votedAt);
  }

  isFrom(userId: string): boolean {
    return this.userId === userId;
  }
}
