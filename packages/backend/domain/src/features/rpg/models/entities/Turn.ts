import { IRandomChoicePolicy } from "../../interfaces";
import { TurnStatus, TurnResolutionReason } from "../../types";
import { TurnId, ActionId, PresentPlayers, VoteWindow } from "../value-objects";
import { TurnResolution } from "./TurnResolution";
import { TurnVote } from "./TurnVote";

interface StartTurnParams {
  roomId: string;
  number: number;
  presentPlayerIds: string[];
  availableActionIds: string[];
  startedAt: Date;
  decisionDurationMs: number;
}

export class Turn {
  readonly id: TurnId;
  readonly roomId: string;
  readonly number: number;
  readonly availableActionIds: ActionId[];

  private _status: TurnStatus;
  private _presentPlayers: PresentPlayers;
  private _votes: TurnVote[];
  private _voteWindow: VoteWindow;
  private _resolution: TurnResolution | null;

  private constructor(params: {
    id: TurnId;
    roomId: string;
    number: number;
    availableActionIds: ActionId[];
    status: TurnStatus;
    presentPlayers: PresentPlayers;
    votes: TurnVote[];
    voteWindow: VoteWindow;
    resolution: TurnResolution | null;
  }) {
    if (!params.roomId || params.roomId.trim().length === 0) {
      throw new Error("Turn roomId cannot be empty");
    }

    if (params.number <= 0) {
      throw new Error("Turn number must be greater than 0");
    }

    if (params.availableActionIds.length === 0) {
      throw new Error("Turn must have at least one available action");
    }

    this.id = params.id;
    this.roomId = params.roomId;
    this.number = params.number;
    this.availableActionIds = params.availableActionIds;
    this._status = params.status;
    this._presentPlayers = params.presentPlayers;
    this._votes = params.votes;
    this._voteWindow = params.voteWindow;
    this._resolution = params.resolution;
  }

  static start(params: StartTurnParams): Turn {
    if (params.decisionDurationMs <= 0) {
      throw new Error("decisionDurationMs must be greater than 0");
    }

    const startedAtMs = params.startedAt.getTime();

    return new Turn({
      id: TurnId.generate(),
      roomId: params.roomId.trim(),
      number: params.number,
      availableActionIds: params.availableActionIds.map((id) => ActionId.create(id)),
      status: "open",
      presentPlayers: PresentPlayers.create(params.presentPlayerIds),
      votes: [],
      voteWindow: new VoteWindow(params.startedAt, new Date(startedAtMs + params.decisionDurationMs), null),
      resolution: null,
    });
  }

  get status(): TurnStatus {
    return this._status;
  }

  get presentPlayers(): string[] {
    return this._presentPlayers.values();
  }

  get votes(): TurnVote[] {
    return [...this._votes];
  }

  get voteWindow(): VoteWindow {
    return this._voteWindow;
  }

  get resolution(): TurnResolution | null {
    return this._resolution;
  }

  get userCount(): number {
    return this._presentPlayers.count();
  }

  isClosed(): boolean {
    return this._status === "closed";
  }

  hasPlayer(userId: string): boolean {
    return this._presentPlayers.has(userId);
  }

  vote(userId: string, actionId: string, now: Date, finalizationDurationMs: number): void {
    this.ensureOpenOrFinalizing();
    this.ensurePresentPlayer(userId);

    const normalizedAction = ActionId.create(actionId);

    if (!this.hasAvailableAction(normalizedAction)) {
      throw new Error(`Unknown action "${actionId}" for this turn`);
    }

    this._votes = [
      ...this._votes.filter((vote) => !vote.isFrom(userId)),
      TurnVote.create(userId, normalizedAction, now),
    ];

    this.recomputeFinalizationState(now, finalizationDurationMs);
  }

  joinPlayer(userId: string, now: Date, finalizationDurationMs: number): void {
    this.ensureOpenOrFinalizing();

    this._presentPlayers = this._presentPlayers.join(userId);
    this.recomputeFinalizationState(now, finalizationDurationMs);
  }

  leavePlayer(userId: string, now: Date, finalizationDurationMs: number): void {
    this.ensureOpenOrFinalizing();

    if (!this._presentPlayers.has(userId)) {
      return;
    }

    this._presentPlayers = this._presentPlayers.leave(userId);
    this._votes = this._votes.filter((vote) => !vote.isFrom(userId));

    this.recomputeFinalizationState(now, finalizationDurationMs);
  }

  tick(now: Date, randomChoicePolicy: IRandomChoicePolicy): void {
    if (this.isClosed()) {
      return;
    }

    if (this._voteWindow.isFinalizationExpired(now)) {
      this.close(now, randomChoicePolicy, "finalization-timeout");
      return;
    }

    if (this._voteWindow.isDecisionExpired(now)) {
      this.close(now, randomChoicePolicy, "decision-timeout");
    }
  }

  hasAbsoluteMajority(): boolean {
    const threshold = Math.floor(this.userCount / 2) + 1;
    return this.getHighestVoteCount() >= threshold;
  }

  haveAllPresentPlayersVoted(): boolean {
    return this.getUniqueVoterCount() === this.userCount;
  }

  getVoteCountFor(actionId: string): number {
    return this._votes.filter((vote) => vote.actionId.value === actionId).length;
  }

  getVoteCounts(): Map<string, number> {
    const counts = new Map<string, number>();

    for (const action of this.availableActionIds) {
      counts.set(action.value, 0);
    }

    for (const vote of this._votes) {
      counts.set(vote.actionId.value, (counts.get(vote.actionId.value) ?? 0) + 1);
    }

    return counts;
  }

  getWinningActionIds(): ActionId[] {
    const counts = this.getVoteCounts();
    const max = Math.max(...counts.values());

    if (max <= 0) {
      return [];
    }

    return this.availableActionIds.filter((action) => (counts.get(action.value) ?? 0) === max);
  }

  private close(now: Date, randomChoicePolicy: IRandomChoicePolicy, reason: TurnResolutionReason): void {
    if (this.isClosed()) {
      return;
    }

    const winningActions = this.getWinningActionIds();
    const isTie = winningActions.length > 1;
    const selectedAction =
      winningActions.length === 0
        ? null
        : winningActions.length === 1
          ? winningActions[0]
          : randomChoicePolicy.pickOne(winningActions);

    this._resolution = TurnResolution.create({
      selectedActionId: selectedAction,
      reason,
      isTie,
      resolvedAt: now,
    });

    this._status = "closed";
    this._voteWindow = this._voteWindow.withFinalizationDeadline(null);
  }

  private recomputeFinalizationState(now: Date, finalizationDurationMs: number): void {
    if (this.isClosed()) {
      return;
    }

    if (finalizationDurationMs <= 0) {
      throw new Error("finalizationDurationMs must be greater than 0");
    }

    const shouldFinalize = this.hasAbsoluteMajority() || this.haveAllPresentPlayersVoted();

    if (shouldFinalize) {
      if (this._status !== "finalizing") {
        this._status = "finalizing";
        this._voteWindow = this._voteWindow.withFinalizationDeadline(new Date(now.getTime() + finalizationDurationMs));
      }
      return;
    }

    if (this._status === "finalizing") {
      this._status = "open";
      this._voteWindow = this._voteWindow.withFinalizationDeadline(null);
    }
  }

  private ensureOpenOrFinalizing(): void {
    if (this.isClosed()) {
      throw new Error("Cannot modify a closed turn");
    }
  }

  private ensurePresentPlayer(userId: string): void {
    if (!this._presentPlayers.has(userId)) {
      throw new Error(`User "${userId}" is not present in this turn`);
    }
  }

  private hasAvailableAction(actionId: ActionId): boolean {
    return this.availableActionIds.some((action) => action.equals(actionId));
  }

  private getUniqueVoterCount(): number {
    return new Set(this._votes.map((vote) => vote.userId)).size;
  }

  private getHighestVoteCount(): number {
    const counts = this.getVoteCounts();
    return counts.size === 0 ? 0 : Math.max(...counts.values());
  }
}
