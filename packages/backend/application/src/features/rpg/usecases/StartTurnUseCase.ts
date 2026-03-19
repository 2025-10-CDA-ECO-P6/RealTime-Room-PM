import { ITurnRepository, IClock, ITurnStatePublisher, Turn } from "@repo/backend-domain";
import { StartTurnDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";
import { IStartTurnUseCase } from "../interfaces";

export class StartTurnUseCase implements IStartTurnUseCase {
  constructor(
    private readonly turnRepository: ITurnRepository,
    private readonly clock: IClock,
    private readonly turnStatePublisher: ITurnStatePublisher,
  ) {}

  async execute(dto: StartTurnDTO): Promise<TurnStateDTO> {
    const existing = await this.turnRepository.getCurrentByRoomId(dto.roomId);

    if (existing !== null && !existing.isClosed()) {
      throw new Error(`An active turn already exists for room "${dto.roomId}"`);
    }

    const turn = Turn.start({
      roomId: dto.roomId,
      number: dto.number,
      presentPlayerIds: dto.presentPlayerIds,
      availableActionIds: dto.availableActionIds,
      startedAt: this.clock.now(),
      decisionDurationMs: dto.decisionDurationMs,
    });

    await this.turnRepository.save(turn);
    await this.turnStatePublisher.publishTurnUpdated(turn);

    return toTurnStateDTO(turn);
  }
}
