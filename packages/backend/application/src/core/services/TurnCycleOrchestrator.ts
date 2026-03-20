import {
  ITurnRepository,
  ITurnStatePublisher,
  IClock,
  IRandomChoicePolicy,
  RoomId,
  Turn,
  UserId,
  TurnActionId,
} from "@repo/backend-domain";
import {
  ITurnCycleOrchestrator,
  IRoomPresenceReader,
  ITurnScheduler,
  ITurnActionComposer,
  ITurnActionResolverRegistry,
  IGameFlowPolicy,
} from "../interfaces";

export class TurnCycleOrchestrator implements ITurnCycleOrchestrator {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly turnStatePublisher: ITurnStatePublisher,
    private readonly clock: IClock,
    private readonly randomChoicePolicy: IRandomChoicePolicy,
    private readonly roomPresenceReader: IRoomPresenceReader,
    private readonly turnScheduler: ITurnScheduler,
    private readonly turnActionComposer: ITurnActionComposer,
    private readonly turnActionResolverRegistry: ITurnActionResolverRegistry,
    private readonly gameFlowPolicy: IGameFlowPolicy,
  ) {}

  async startGame(roomId: string): Promise<void> {
    const normalizedRoomId = RoomId.create(roomId);

    const existing = await this.turnRepository.getCurrentByRoomId(normalizedRoomId.value);

    if (existing !== null && !existing.isClosed()) {
      await this.scheduleCurrentTurn(existing);
      return;
    }

    const presentPlayerIds = await this.roomPresenceReader.getPresentUserIds(normalizedRoomId.value);

    if (presentPlayerIds.length === 0) {
      return;
    }

    const now = this.clock.now();

    const availableActions = await this.turnActionComposer.compose({
      roomId: normalizedRoomId.value,
      turnNumber: 1,
      presentPlayerIds,
      previousResolution: null,
      now,
    });

    if (availableActions.length === 0) {
      throw new Error(`No available actions for room "${normalizedRoomId.value}" at turn 1`);
    }

    const turn = Turn.start({
      roomId: normalizedRoomId,
      number: 1,
      presentPlayerIds: presentPlayerIds.map((playerId) => UserId.create(playerId)),
      availableActionIds: availableActions.map((action) => TurnActionId.create(action.id)),
      startedAt: now,
      decisionDurationMs: 10000,
    });

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);
    await this.scheduleCurrentTurn(turn);
  }

  async onTurnStateChanged(roomId: string): Promise<void> {
    const normalizedRoomId = RoomId.create(roomId);
    const turn = await this.turnRepository.getCurrentByRoomId(normalizedRoomId.value);

    if (turn === null) {
      return;
    }

    if (turn.isClosed()) {
      await this.handleClosedTurn(turn);
      return;
    }

    await this.scheduleCurrentTurn(turn);
  }

  async tick(roomId: string): Promise<void> {
    const normalizedRoomId = RoomId.create(roomId);
    const turn = await this.turnRepository.getCurrentByRoomId(normalizedRoomId.value);

    if (turn === null) {
      return;
    }

    const wasClosed = turn.isClosed();

    turn.tick(this.clock.now(), this.randomChoicePolicy);

    await this.turnRepository.save(turn);

    if (!wasClosed) {
      await this.turnStatePublisher.publishTurnUpdated(turn);
    }

    if (turn.resolution !== null) {
      await this.turnStatePublisher.publishTurnClosed(turn, turn.resolution);
      await this.handleClosedTurn(turn);
      return;
    }

    await this.scheduleCurrentTurn(turn);
  }

  async stopGame(roomId: string): Promise<void> {
    const normalizedRoomId = RoomId.create(roomId);
    await this.turnScheduler.cancel(normalizedRoomId.value);
  }

  private async handleClosedTurn(turn: Turn): Promise<void> {
    await this.turnScheduler.cancel(turn.roomId.value);

    if (turn.resolution === null) {
      return;
    }

    const presentPlayerIds = await this.roomPresenceReader.getPresentUserIds(turn.roomId.value);

    if (turn.resolution.selectedActionId !== null) {
      await this.turnActionResolverRegistry.resolve({
        roomId: turn.roomId.value,
        turnNumber: turn.number,
        actionId: turn.resolution.selectedActionId.value,
        presentPlayerIds,
        resolvedAt: turn.resolution.resolvedAt,
      });
    }

    const shouldContinue = await this.gameFlowPolicy.shouldContinue({
      roomId: turn.roomId.value,
      previousTurnNumber: turn.number,
      previousResolution: {
        selectedActionId: turn.resolution.selectedActionId?.value ?? null,
        reason: turn.resolution.reason,
        isTie: turn.resolution.isTie,
        resolvedAt: turn.resolution.resolvedAt,
      },
      presentPlayerIds,
      now: this.clock.now(),
    });

    if (!shouldContinue || presentPlayerIds.length === 0) {
      return;
    }

    const nextTurnNumber = this.gameFlowPolicy.getNextTurnNumber(turn.number);

    const availableActions = await this.turnActionComposer.compose({
      roomId: turn.roomId.value,
      turnNumber: nextTurnNumber,
      presentPlayerIds,
      previousResolution: {
        selectedActionId: turn.resolution.selectedActionId?.value ?? null,
        reason: turn.resolution.reason,
        isTie: turn.resolution.isTie,
        resolvedAt: turn.resolution.resolvedAt,
      },
      now: this.clock.now(),
    });

    if (availableActions.length === 0) {
      return;
    }

    const nextTurn = Turn.start({
      roomId: turn.roomId,
      number: nextTurnNumber,
      presentPlayerIds: presentPlayerIds.map((playerId) => UserId.create(playerId)),
      availableActionIds: availableActions.map((action) => TurnActionId.create(action.id)),
      startedAt: this.clock.now(),
      decisionDurationMs: 10000,
    });

    await this.turnRepository.save(nextTurn);
    await this.turnStatePublisher.publishTurnUpdated(nextTurn);
    await this.scheduleCurrentTurn(nextTurn);
  }

  private async scheduleCurrentTurn(turn: Turn): Promise<void> {
    await this.turnScheduler.cancel(turn.roomId.value);
    await this.turnScheduler.schedule(turn.roomId.value, turn.getNextCheckpointAt());
  }
}
