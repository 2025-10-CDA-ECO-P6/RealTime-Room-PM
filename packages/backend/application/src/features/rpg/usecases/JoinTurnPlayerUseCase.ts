import { ITurnRepository, IClock, ITurnStatePublisher } from "@repo/backend-domain";
import { JoinTurnPlayerDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";
import { IJoinTurnPlayerUseCase } from "../interfaces";

export class JoinTurnPlayerUseCase implements IJoinTurnPlayerUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly turnStatePublisher: ITurnStatePublisher,
  ) {}

  async execute(dto: JoinTurnPlayerDTO): Promise<TurnStateDTO> {
    const turn = await this.turnRepository.getCurrentByRoomId(dto.roomId);

    if (turn === null) {
      throw new Error(`No active turn found for room "${dto.roomId}"`);
    }

    turn.joinPlayer(dto.userId, this.clock.now(), dto.finalizationDurationMs);

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);

    return toTurnStateDTO(turn);
  }
}
