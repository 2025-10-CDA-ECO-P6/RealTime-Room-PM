import { ITurnRepository, IClock, IRandomChoicePolicy, ITurnStatePublisher } from "@repo/backend-domain";
import { TickTurnDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";
import { ITickTurnUseCase } from "../interfaces";

export class TickTurnUseCase implements ITickTurnUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly randomChoicePolicy: IRandomChoicePolicy,
    private readonly turnStatePublisher: ITurnStatePublisher,
  ) {}

  async execute(dto: TickTurnDTO): Promise<TurnStateDTO | null> {
    const turn = await this.turnRepository.getCurrentByRoomId(dto.roomId);

    if (turn === null) {
      return null;
    }

    const wasClosed = turn.isClosed();

    turn.tick(this.clock.now(), this.randomChoicePolicy);

    await this.turnRepository.save(turn);

    if (!wasClosed) {
      await this.turnStatePublisher.publishTurnUpdated(turn);
    }

    if (turn.resolution !== null) {
      await this.turnStatePublisher.publishTurnClosed(turn, turn.resolution);
    }

    return toTurnStateDTO(turn);
  }
}
