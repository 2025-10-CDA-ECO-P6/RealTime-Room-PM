import { ITurnRepository, RoomId } from "@repo/backend-domain";
import { ITickTurnUseCase, ITurnCycleOrchestrator } from "../interfaces";
import { TickTurnDTO, TurnStateDTO } from "../dtos";
import { toTurnStateDTO } from "../dtos/TurnStateDTO";

export class TickTurnUseCase implements ITickTurnUseCase {
  constructor(
    private readonly turnCycleOrchestrator: ITurnCycleOrchestrator,
    private readonly turnRepository: ITurnRepository,
  ) {}

  async execute(dto: TickTurnDTO): Promise<TurnStateDTO | null> {
    const roomId = RoomId.create(dto.roomId);

    await this.turnCycleOrchestrator.tick(roomId.value);

    const turn = await this.turnRepository.getCurrentByRoomId(roomId.value);

    return turn ? toTurnStateDTO(turn) : null;
  }
}
