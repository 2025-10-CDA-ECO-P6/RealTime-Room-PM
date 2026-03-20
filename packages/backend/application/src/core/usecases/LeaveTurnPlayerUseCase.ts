import { ITurnRepository, IClock, ITurnStatePublisher, RoomId, UserId } from "@repo/backend-domain";
import { LeaveTurnPlayerDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";
import { ILeaveTurnPlayerUseCase, ITurnCycleOrchestrator } from "../interfaces";

export class LeaveTurnPlayerUseCase implements ILeaveTurnPlayerUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly turnStatePublisher: ITurnStatePublisher,
    private readonly turnCycleOrchestrator: ITurnCycleOrchestrator,
  ) {}

  async execute(dto: LeaveTurnPlayerDTO): Promise<TurnStateDTO> {
    const roomId = RoomId.create(dto.roomId);
    const userId = UserId.create(dto.userId);

    const turn = await this.turnRepository.getCurrentByRoomId(roomId.value);

    if (turn === null) {
      throw new Error(`No active turn found for room "${roomId.value}"`);
    }

    turn.leavePlayer(userId, this.clock.now(), dto.finalizationDurationMs);

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);

    if (turn.resolution !== null) {
      await this.turnStatePublisher.publishTurnClosed(turn, turn.resolution);
    }

    await this.turnCycleOrchestrator.onTurnStateChanged(roomId.value);

    return toTurnStateDTO(turn);
  }
}
