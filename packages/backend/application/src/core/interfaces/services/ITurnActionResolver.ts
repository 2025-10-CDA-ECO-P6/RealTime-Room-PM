export interface ITurnActionResolver {
  canResolve(actionId: string): boolean;

  resolve(params: {
    roomId: string;
    turnNumber: number;
    actionId: string;
    presentPlayerIds: string[];
    resolvedAt: Date;
  }): Promise<void>;
}
