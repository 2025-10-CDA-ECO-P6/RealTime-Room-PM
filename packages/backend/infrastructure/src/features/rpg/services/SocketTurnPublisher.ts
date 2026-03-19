import { ITurnStatePublisher, Turn, TurnResolution } from "@repo/backend-domain";
import { Server as SocketIOServer } from "socket.io";

export class SocketTurnPublisher implements ITurnStatePublisher {
  constructor(private readonly io: SocketIOServer) {}

  async publishTurnUpdated(turn: Turn): Promise<void> {
    this.io.to(`room_${turn.roomId}`).emit("rpg_turn_updated", {
      turnId: turn.id.value,
      roomId: turn.roomId,
      number: turn.number,
      status: turn.status,
      userCount: turn.userCount,
      presentPlayerIds: turn.presentPlayers,
      votes: turn.votes.map((vote) => ({
        userId: vote.userId,
        actionId: vote.actionId.value,
        votedAt: vote.votedAt,
      })),
      availableActionIds: turn.availableActionIds.map((action) => action.value),
      decisionDeadlineAt: turn.voteWindow.decisionDeadlineAt,
      finalizationDeadlineAt: turn.voteWindow.finalizationDeadlineAt,
    });
  }

  async publishTurnClosed(turn: Turn, resolution: TurnResolution): Promise<void> {
    this.io.to(`room_${turn.roomId}`).emit("rpg_turn_closed", {
      turnId: turn.id.value,
      roomId: turn.roomId,
      number: turn.number,
      status: turn.status,
      resolution: {
        selectedActionId: resolution.selectedActionId?.value ?? null,
        reason: resolution.reason,
        isTie: resolution.isTie,
        resolvedAt: resolution.resolvedAt,
      },
    });
  }
}
