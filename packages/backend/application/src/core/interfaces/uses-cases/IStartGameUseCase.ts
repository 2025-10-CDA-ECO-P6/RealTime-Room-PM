import { StartGameDTO } from "../../dtos";

export interface IStartGameUseCase {
  execute(dto: StartGameDTO): Promise<void>;
}