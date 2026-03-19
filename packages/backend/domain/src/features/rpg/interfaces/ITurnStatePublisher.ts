import { TurnResolution } from "../models/entities";
import { Turn } from "../models/entities/Turn";

export interface ITurnStatePublisher {
  publishTurnUpdated(turn: Turn): Promise<void>;
  publishTurnClosed(turn: Turn, resolution: TurnResolution): Promise<void>;
}
