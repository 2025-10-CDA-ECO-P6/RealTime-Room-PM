import type { RpgAction } from "./RpgAction";
import type { RpgPhase } from "./RpgPhase";

export interface RpgState {
  heroName: string;
  phase: RpgPhase;
  availableActions: RpgAction[];
  players: string[];
  turn: number;
}
