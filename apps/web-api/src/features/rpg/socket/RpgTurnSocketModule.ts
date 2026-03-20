import {
  IJoinTurnPlayerUseCase,
  ILeaveTurnPlayerUseCase,
  IStartGameUseCase,
  ISubmitVoteUseCase,
  ITickTurnUseCase,
} from "@repo/backend-application";
import { ISocketConnection, ISocketModule, ISocketServer } from "@repo/backend-infrastructure";
import { SubmitVotePayload, JoinTurnPayload, LeaveTurnPayload, TickTurnPayload, StartGamePayload } from "../types/type";

const DISCONNECT_FINALIZATION_DURATION_MS = 1000;

export class RpgTurnSocketModule implements ISocketModule {
  constructor(
    private readonly socketServer: ISocketServer,
    private readonly startGameUseCase: IStartGameUseCase,
    private readonly submitVoteUseCase: ISubmitVoteUseCase,
    private readonly joinTurnPlayerUseCase: IJoinTurnPlayerUseCase,
    private readonly leaveTurnPlayerUseCase: ILeaveTurnPlayerUseCase,
    private readonly tickTurnUseCase: ITickTurnUseCase,
  ) {}

  register(): void {
    this.socketServer.onConnection((connection: ISocketConnection) => {
      connection.on("rpg_start_game", async (payload: unknown) => {
        await this.handleStartGame(connection, payload);
      });

      connection.on("rpg_submit_vote", async (payload: unknown) => {
        await this.handleSubmitVote(connection, payload);
      });

      connection.on("rpg_join_turn", async (payload: unknown) => {
        await this.handleJoinTurn(connection, payload);
      });

      connection.on("rpg_leave_turn", async (payload: unknown) => {
        await this.handleLeaveTurn(connection, payload);
      });

      connection.on("rpg_tick_turn", async (payload: unknown) => {
        await this.handleTickTurn(connection, payload);
      });

      connection.on("disconnect", async () => {
        await this.handleDisconnect(connection);
      });
    });
  }

  private async handleStartGame(connection: ISocketConnection, payload: unknown): Promise<void> {
    try {
      const data = payload as StartGamePayload;
      const context = connection.getContext();
      const roomId = data.roomId ?? context.roomId;

      if (!roomId) {
        connection.emit("error", { message: "roomId is required" });
        return;
      }

      console.log("[RpgTurnSocketModule] rpg_start_game", { roomId });

      await this.startGameUseCase.execute({
        roomId,
      });

      connection.emit("rpg_start_game_ack", {
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start game";
      console.error("[RpgTurnSocketModule] rpg_start_game error:", message);
      connection.emit("error", { message });
    }
  }

  private async handleSubmitVote(connection: ISocketConnection, payload: unknown): Promise<void> {
    try {
      const data = payload as SubmitVotePayload;
      const context = connection.getContext();

      if (!context.roomId || !context.userId) {
        connection.emit("error", { message: "Not in a room" });
        return;
      }

      console.log("[RpgTurnSocketModule] rpg_submit_vote", {
        roomId: context.roomId,
        userId: context.userId,
        actionId: data.actionId,
      });

      const turn = await this.submitVoteUseCase.execute({
        roomId: context.roomId,
        userId: context.userId,
        actionId: data.actionId,
        finalizationDurationMs: data.finalizationDurationMs,
      });

      connection.emit("rpg_submit_vote_ack", {
        success: true,
        turn,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit vote";
      console.error("[RpgTurnSocketModule] rpg_submit_vote error:", message);
      connection.emit("error", { message });
    }
  }

  private async handleJoinTurn(connection: ISocketConnection, payload: unknown): Promise<void> {
    try {
      const data = payload as JoinTurnPayload;
      const context = connection.getContext();

      if (!context.roomId || !context.userId) {
        connection.emit("error", { message: "Not in a room" });
        return;
      }

      console.log("[RpgTurnSocketModule] rpg_join_turn", {
        roomId: context.roomId,
        userId: context.userId,
      });

      const turn = await this.joinTurnPlayerUseCase.execute({
        roomId: context.roomId,
        userId: context.userId,
        finalizationDurationMs: data.finalizationDurationMs,
      });

      connection.emit("rpg_join_turn_ack", {
        success: true,
        turn,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to join turn";
      console.error("[RpgTurnSocketModule] rpg_join_turn error:", message);
      connection.emit("error", { message });
    }
  }

  private async handleLeaveTurn(connection: ISocketConnection, payload: unknown): Promise<void> {
    try {
      const data = payload as LeaveTurnPayload;
      const context = connection.getContext();

      if (!context.roomId || !context.userId) {
        connection.emit("error", { message: "Not in a room" });
        return;
      }

      console.log("[RpgTurnSocketModule] rpg_leave_turn", {
        roomId: context.roomId,
        userId: context.userId,
      });

      const turn = await this.leaveTurnPlayerUseCase.execute({
        roomId: context.roomId,
        userId: context.userId,
        finalizationDurationMs: data.finalizationDurationMs,
      });

      connection.emit("rpg_leave_turn_ack", {
        success: true,
        turn,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to leave turn";
      console.error("[RpgTurnSocketModule] rpg_leave_turn error:", message);
      connection.emit("error", { message });
    }
  }

  private async handleTickTurn(connection: ISocketConnection, payload: unknown): Promise<void> {
    try {
      const data = payload as TickTurnPayload;
      const context = connection.getContext();
      const roomId = data.roomId ?? context.roomId;

      if (!roomId) {
        connection.emit("error", { message: "roomId is required" });
        return;
      }

      console.log("[RpgTurnSocketModule] rpg_tick_turn", { roomId });

      const turn = await this.tickTurnUseCase.execute({
        roomId,
      });

      connection.emit("rpg_tick_turn_ack", {
        success: true,
        turn,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to tick turn";
      console.error("[RpgTurnSocketModule] rpg_tick_turn error:", message);
      connection.emit("error", { message });
    }
  }

  private async handleDisconnect(connection: ISocketConnection): Promise<void> {
    try {
      const context = connection.getContext();

      if (!context.roomId || !context.userId) {
        return;
      }

      await this.leaveTurnPlayerUseCase.execute({
        roomId: context.roomId,
        userId: context.userId,
        finalizationDurationMs: DISCONNECT_FINALIZATION_DURATION_MS,
      });

      console.log(
        `[RpgTurnSocketModule] User ${context.userId} removed from active turn in room ${context.roomId} on disconnect`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to handle RPG disconnect";
      console.error("[RpgTurnSocketModule] disconnect error:", message);
    }
  }
}