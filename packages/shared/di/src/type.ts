import { DIContainer } from "./DIContainer";

export type Factory<T> = (container: DIContainer) => T;

type Scope = "singleton" | "scoped" | "transient";

export interface Provider<T> {
  factory: Factory<T>;
  scope: Scope;
  instance?: T;
}
