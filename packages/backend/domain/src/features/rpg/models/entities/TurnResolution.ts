import { TurnResolutionReason } from "../../types";
import { ActionId } from "../value-objects";

export class TurnResolution {
  constructor(
    readonly selectedActionId: ActionId | null,
    readonly reason: TurnResolutionReason,
    readonly isTie: boolean,
    readonly resolvedAt: Date,
  ) {}

  static create(params: {
    selectedActionId: ActionId | null;
    reason: TurnResolutionReason;
    isTie: boolean;
    resolvedAt: Date;
  }): TurnResolution {
    return new TurnResolution(params.selectedActionId, params.reason, params.isTie, params.resolvedAt);
  }
}
