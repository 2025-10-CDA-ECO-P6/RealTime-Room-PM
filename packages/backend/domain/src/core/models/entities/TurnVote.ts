import { TurnActionId, UserId } from "../value-objects";

export class TurnVote {
  constructor(
    readonly userId: UserId,
    readonly actionId: TurnActionId,
    readonly votedAt: Date,
  ) {}

  static create(userId: UserId, actionId: TurnActionId, votedAt: Date): TurnVote {
    return new TurnVote(userId, actionId, votedAt);
  }

  isFrom(userId: UserId): boolean {
    return this.userId.equals(userId);
  }
}