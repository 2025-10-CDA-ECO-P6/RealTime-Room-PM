export type StartTurnPayload = {
  roomId: string;
  number: number;
  presentPlayerIds: string[];
  availableActionIds: string[];
  decisionDurationMs: number;
};

export type SubmitVotePayload = {
  actionId: string;
  finalizationDurationMs: number;
};

export type JoinTurnPayload = {
  finalizationDurationMs: number;
};

export type LeaveTurnPayload = {
  finalizationDurationMs: number;
};

export type TickTurnPayload = {
  roomId?: string;
};
