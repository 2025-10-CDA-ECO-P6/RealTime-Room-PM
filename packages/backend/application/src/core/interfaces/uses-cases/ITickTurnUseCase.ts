import { TickTurnDTO, TurnStateDTO } from "../../dtos";

export interface ITickTurnUseCase {
  execute(dto: TickTurnDTO): Promise<TurnStateDTO | null>;
}
