import { ITurnRepository, IClock, ITurnStatePublisher, RoomId, TurnActionId, UserId } from "@repo/backend-domain";
import { ISubmitVoteUseCase, ITurnCycleOrchestrator } from "../interfaces";
import { SubmitVoteDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";

export class SubmitVoteUseCase implements ISubmitVoteUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly turnStatePublisher: ITurnStatePublisher,
    private readonly turnCycleOrchestrator: ITurnCycleOrchestrator,
  ) {}

  async execute(dto: SubmitVoteDTO): Promise<TurnStateDTO> {
    const roomId = RoomId.create(dto.roomId);
    const userId = UserId.create(dto.userId);
    const actionId = TurnActionId.create(dto.actionId);

    const turn = await this.turnRepository.getCurrentByRoomId(roomId.value);

    if (turn === null) {
      throw new Error(`No active turn found for room "${roomId.value}"`);
    }

    turn.vote(userId, actionId, this.clock.now(), dto.finalizationDurationMs);

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);

    if (turn.resolution !== null) {
      await this.turnStatePublisher.publishTurnClosed(turn, turn.resolution);
    }

    await this.turnCycleOrchestrator.onTurnStateChanged(roomId.value);

    return toTurnStateDTO(turn);
  }
}
