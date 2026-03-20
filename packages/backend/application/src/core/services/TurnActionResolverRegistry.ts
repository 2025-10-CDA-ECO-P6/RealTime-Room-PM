import { ITurnActionResolver, ITurnActionResolverRegistry } from "../interfaces";

export class TurnActionResolverRegistry implements ITurnActionResolverRegistry {
  private readonly resolvers: ITurnActionResolver[] = [];

  register(resolver: ITurnActionResolver): void {
    this.resolvers.push(resolver);
  }

  async resolve(params: {
    roomId: string;
    turnNumber: number;
    actionId: string;
    presentPlayerIds: string[];
    resolvedAt: Date;
  }): Promise<void> {
    const resolver = this.resolvers.find((item) => item.canResolve(params.actionId));

    if (!resolver) {
      throw new Error(`No resolver found for action "${params.actionId}"`);
    }

    await resolver.resolve(params);
  }
}
