import { ITurnRepository, IClock, ITurnStatePublisher, Turn, RoomId, TurnActionId, UserId } from "@repo/backend-domain";
import { StartTurnDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";
import { IStartTurnUseCase, ITurnCycleOrchestrator } from "../interfaces";

export class StartTurnUseCase implements IStartTurnUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly turnStatePublisher: ITurnStatePublisher,
    private readonly turnCycleOrchestrator: ITurnCycleOrchestrator,
  ) {}

  async execute(dto: StartTurnDTO): Promise<TurnStateDTO> {
    const roomId = RoomId.create(dto.roomId);

    const existing = await this.turnRepository.getCurrentByRoomId(roomId.value);

    if (existing !== null && !existing.isClosed()) {
      throw new Error(`An active turn already exists for room "${roomId.value}"`);
    }

    const turn = Turn.start({
      roomId,
      number: dto.number,
      presentPlayerIds: dto.presentPlayerIds.map((playerId) => UserId.create(playerId)),
      availableActionIds: dto.availableActionIds.map((actionId) => TurnActionId.create(actionId)),
      startedAt: this.clock.now(),
      decisionDurationMs: dto.decisionDurationMs,
    });

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);
    await this.turnCycleOrchestrator.onTurnStateChanged(roomId.value);

    return toTurnStateDTO(turn);
  }
}