export interface StartTurnDTO {
  roomId: string;
  number: number;
  presentPlayerIds: string[];
  availableActionIds: string[];
  decisionDurationMs: number;
}
