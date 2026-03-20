import { Turn, TurnResolution } from "../models/entities";

export interface ITurnStatePublisher {
  publishTurnUpdated(turn: Turn): Promise<void>;
  publishTurnClosed(turn: Turn, resolution: TurnResolution): Promise<void>;
}
