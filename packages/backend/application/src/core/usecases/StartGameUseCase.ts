import { RoomId } from "@repo/backend-domain";
import { StartGameDTO } from "../dtos";
import { IStartGameUseCase, ITurnCycleOrchestrator } from "../interfaces";

export class StartGameUseCase implements IStartGameUseCase {
  constructor(private readonly turnCycleOrchestrator: ITurnCycleOrchestrator) {}

  async execute(dto: StartGameDTO): Promise<void> {
    const roomId = RoomId.create(dto.roomId);
    await this.turnCycleOrchestrator.startGame(roomId.value);
  }
}
