import { LeaveTurnPlayerDTO, TurnStateDTO } from "../dtos";

export interface ILeaveTurnPlayerUseCase {
  execute(dto: LeaveTurnPlayerDTO): Promise<TurnStateDTO>;
}
