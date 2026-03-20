export class TurnVoteWindow {
  constructor(
    readonly startedAt: Date,
    readonly decisionDeadlineAt: Date,
    readonly finalizationDeadlineAt: Date | null,
  ) {
    if (decisionDeadlineAt.getTime() <= startedAt.getTime()) {
      throw new Error("Decision deadline must be after start time");
    }

    if (finalizationDeadlineAt !== null && finalizationDeadlineAt.getTime() < startedAt.getTime()) {
      throw new Error("Finalization deadline cannot be before start time");
    }
  }

  withFinalizationDeadline(finalizationDeadlineAt: Date | null): TurnVoteWindow {
    return new TurnVoteWindow(this.startedAt, this.decisionDeadlineAt, finalizationDeadlineAt);
  }

  isDecisionExpired(now: Date): boolean {
    return now.getTime() >= this.decisionDeadlineAt.getTime();
  }

  isFinalizationExpired(now: Date): boolean {
    if (this.finalizationDeadlineAt === null) {
      return false;
    }

    return now.getTime() >= this.finalizationDeadlineAt.getTime();
  }
}
