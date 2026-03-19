import { ITurnStatePublisher, Turn, TurnResolution } from "@repo/backend-domain";

export class FakeTurnStatePublisher implements ITurnStatePublisher {
  readonly updatedTurns: Turn[] = [];
  readonly closedTurns: Array<{ turn: Turn; resolution: TurnResolution }> = [];

  async publishTurnUpdated(turn: Turn): Promise<void> {
    this.updatedTurns.push(turn);
  }

  async publishTurnClosed(turn: Turn, resolution: TurnResolution): Promise<void> {
    this.closedTurns.push({ turn, resolution });
  }
}
