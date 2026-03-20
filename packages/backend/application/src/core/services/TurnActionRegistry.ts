import { ITurnActionProvider, ITurnActionRegistry } from "../interfaces";

export class TurnActionRegistry implements ITurnActionRegistry {
  private readonly providers: ITurnActionProvider[] = [];

  register(provider: ITurnActionProvider): void {
    this.providers.push(provider);
  }

  getProviders(): ITurnActionProvider[] {
    return [...this.providers];
  }
}
