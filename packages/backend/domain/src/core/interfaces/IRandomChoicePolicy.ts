export interface IRandomChoicePolicy {
  pickOne<T>(items: T[]): T;
}
