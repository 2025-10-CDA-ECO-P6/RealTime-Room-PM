import { SubmitVoteDTO, TurnStateDTO } from "../../dtos";

export interface ISubmitVoteUseCase {
  execute(dto: SubmitVoteDTO): Promise<TurnStateDTO>;
}
