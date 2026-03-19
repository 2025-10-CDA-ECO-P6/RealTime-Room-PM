import { JoinTurnPlayerDTO, TurnStateDTO } from "../dtos";

export interface IJoinTurnPlayerUseCase {
  execute(dto: JoinTurnPlayerDTO): Promise<TurnStateDTO>;
}
