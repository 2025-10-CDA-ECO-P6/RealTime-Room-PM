import { ITurnRepository, IClock, ITurnStatePublisher } from "@repo/backend-domain";
import { SubmitVoteDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";
import { ISubmitVoteUseCase } from "../interfaces";

export class SubmitVoteUseCase implements ISubmitVoteUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly turnStatePublisher: ITurnStatePublisher,
  ) {}

  async execute(dto: SubmitVoteDTO): Promise<TurnStateDTO> {
    const turn = await this.turnRepository.getCurrentByRoomId(dto.roomId);

    if (turn === null) {
      throw new Error(`No active turn found for room "${dto.roomId}"`);
    }

    turn.vote(dto.userId, dto.actionId, this.clock.now(), dto.finalizationDurationMs);

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);

    if (turn.resolution !== null) {
      await this.turnStatePublisher.publishTurnClosed(turn, turn.resolution);
    }

    return toTurnStateDTO(turn);
  }
}
