export type StartTurnHandler = (data: {
  roomId: string;
  number: number;
  presentPlayerIds: string[];
  availableActionIds: string[];
  decisionDurationMs: number;
}) => Promise<void> | void;

export type SubmitVoteHandler = (data: {
  roomId: string;
  userId: string;
  actionId: string;
  finalizationDurationMs: number;
}) => Promise<void> | void;

export type JoinTurnPlayerHandler = (data: {
  roomId: string;
  userId: string;
  finalizationDurationMs: number;
}) => Promise<void> | void;

export type LeaveTurnPlayerHandler = (data: {
  roomId: string;
  userId: string;
  finalizationDurationMs: number;
}) => Promise<void> | void;

export type TickTurnHandler = (data: { roomId: string }) => Promise<void> | void;
