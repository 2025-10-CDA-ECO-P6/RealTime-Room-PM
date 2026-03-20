import { ITurnStatePublisher, Turn, TurnResolution } from "@repo/backend-domain";
import { ISocketServer } from "..";

export class SocketTurnPublisher implements ITurnStatePublisher {
  constructor(private readonly socketServer: ISocketServer) {}

  async publishTurnUpdated(turn: Turn): Promise<void> {
    this.socketServer.emitToRoom(turn.roomId.value, "rpg_turn_updated", {
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
    });
  }

  async publishTurnClosed(turn: Turn, resolution: TurnResolution): Promise<void> {
    this.socketServer.emitToRoom(turn.roomId.value, "rpg_turn_closed", {
      turnId: turn.id.value,
      roomId: turn.roomId.value,
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
