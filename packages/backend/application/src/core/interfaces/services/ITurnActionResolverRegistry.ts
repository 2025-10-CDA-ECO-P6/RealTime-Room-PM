import { ITurnActionResolver } from "./ITurnActionResolver";

export interface ITurnActionResolverRegistry {
  register(resolver: ITurnActionResolver): void;

  resolve(params: {
    roomId: string;
    turnNumber: number;
    actionId: string;
    presentPlayerIds: string[];
    resolvedAt: Date;
  }): Promise<void>;
}
