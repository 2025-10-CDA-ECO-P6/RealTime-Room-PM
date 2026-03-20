import { ITurnActionProvider } from "./ITurnActionProvider";

export interface ITurnActionRegistry {
  register(provider: ITurnActionProvider): void;
  getProviders(): ITurnActionProvider[];
}
