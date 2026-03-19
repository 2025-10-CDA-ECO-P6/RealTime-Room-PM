import { StartTurnDTO, TurnStateDTO } from "../dtos";


export interface IStartTurnUseCase {
  execute(dto: StartTurnDTO): Promise<TurnStateDTO>;
}
