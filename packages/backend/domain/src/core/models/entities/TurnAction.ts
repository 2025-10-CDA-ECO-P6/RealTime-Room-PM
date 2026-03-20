import { TurnActionId } from "../value-objects/TurnActionId";

export class TurnAction {
  constructor(
    readonly id: TurnActionId,
    readonly label: string,
    readonly sourceFeature: string,
    readonly description?: string,
  ) {
    if (!label || label.trim().length === 0) {
      throw new Error("TurnAction label cannot be empty");
    }

    if (!sourceFeature || sourceFeature.trim().length === 0) {
      throw new Error("TurnAction sourceFeature cannot be empty");
    }
  }

  static create(params: { id: string; label: string; sourceFeature: string; description?: string }): TurnAction {
    return new TurnAction(
      TurnActionId.create(params.id),
      params.label.trim(),
      params.sourceFeature.trim(),
      params.description?.trim(),
    );
  }
}
