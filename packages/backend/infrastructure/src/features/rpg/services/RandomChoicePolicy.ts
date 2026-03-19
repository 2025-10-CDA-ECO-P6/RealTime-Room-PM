import { IRandomChoicePolicy } from "@repo/backend-domain";

export class RandomChoicePolicy implements IRandomChoicePolicy {
  pickOne<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from an empty list");
    }

    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}
