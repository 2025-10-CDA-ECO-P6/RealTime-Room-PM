import { ITurnRepository, IClock, ITurnStatePublisher, RoomId, UserId } from "@repo/backend-domain";
import { IJoinTurnPlayerUseCase, ITurnCycleOrchestrator } from "../interfaces";
import { JoinTurnPlayerDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";

export class JoinTurnPlayerUseCase implements IJoinTurnPlayerUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly turnStatePublisher: ITurnStatePublisher,
    private readonly turnCycleOrchestrator: ITurnCycleOrchestrator,
  ) {}

  async execute(dto: JoinTurnPlayerDTO): Promise<TurnStateDTO> {
    const roomId = RoomId.create(dto.roomId);
    const userId = UserId.create(dto.userId);

    const turn = await this.turnRepository.getCurrentByRoomId(roomId.value);

    if (turn === null) {
      throw new Error(`No active turn found for room "${roomId.value}"`);
    }

    turn.joinPlayer(userId, this.clock.now(), dto.finalizationDurationMs);

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);
    await this.turnCycleOrchestrator.onTurnStateChanged(roomId.value);

    return toTurnStateDTO(turn);
  }
}