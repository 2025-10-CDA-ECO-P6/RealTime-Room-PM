import { Turn } from "@repo/backend-domain";

export interface TurnStateDTO {
  turnId: string;
  roomId: string;
  number: number;
  status: "open" | "finalizing" | "closed";
  userCount: number;
  presentPlayerIds: string[];
  votes: Array<{
    userId: string;
    actionId: string;
    votedAt: Date;
  }>;
  availableActionIds: string[];
  decisionDeadlineAt: Date;
  finalizationDeadlineAt: Date | null;
  resolution: {
    selectedActionId: string | null;
    reason: "absolute-majority" | "all-voted" | "decision-timeout" | "finalization-timeout";
    isTie: boolean;
    resolvedAt: Date;
  } | null;
}

export function toTurnStateDTO(turn: Turn): TurnStateDTO {
  return {
    turnId: turn.id.value,
    roomId: turn.roomId.value,
    number: turn.number,
    status: turn.status,
    userCount: turn.userCount,
    presentPlayerIds: turn.presentPlayers.map((playerId) => playerId.value),
    votes: turn.votes.map((vote) => ({
      userId: vote.userId.value,
      actionId: vote.actionId.value,
      votedAt: vote.votedAt,
    })),
    availableActionIds: turn.availableActionIds.map((actionId) => actionId.value),
    decisionDeadlineAt: turn.voteWindow.decisionDeadlineAt,
    finalizationDeadlineAt: turn.voteWindow.finalizationDeadlineAt,
    resolution: turn.resolution
      ? {
          selectedActionId: turn.resolution.selectedActionId?.value ?? null,
          reason: turn.resolution.reason,
          isTie: turn.resolution.isTie,
          resolvedAt: turn.resolution.resolvedAt,
        }
      : null,
  };
}