import { IRandomChoicePolicy } from "@repo/backend-domain";

export class FakeRandomChoicePolicy implements IRandomChoicePolicy {
  pickOne<T>(items: T[]): T {
    return items[0];
  }
}
