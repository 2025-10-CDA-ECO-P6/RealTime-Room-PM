import { Factory, Provider } from "./type";

export class DIContainer {
  private readonly providers = new Map<string, Provider<any>>();
  private readonly parentContainer?: DIContainer;
  private readonly scopedInstances = new Map<string, any>();

  constructor(parentContainer?: DIContainer) {
    this.parentContainer = parentContainer;
  }

  register<T>(key: string, factory: Factory<T>): void {
    this.providers.set(key, { factory, scope: "transient" });
  }

  scoped<T>(key: string, factory: Factory<T>): void {
    this.providers.set(key, { factory, scope: "scoped" });
  }

  singleton<T>(key: string, factory: Factory<T>): void {
    this.providers.set(key, { factory, scope: "singleton" });
  }

  inject<T>(key: string): T {
    const provider = this.providers.get(key);

    if (provider) {
      if (provider.scope === "singleton") {
        if (!provider.instance) {
          provider.instance = provider.factory(this);
        }
        return provider.instance;
      } else if (provider.scope === "scoped") {
        if (!this.scopedInstances.has(key)) {
          this.scopedInstances.set(key, provider.factory(this));
        }
        return this.scopedInstances.get(key);
      } else {
        return provider.factory(this);
      }
    }

    if (this.parentContainer) {
      const parentProvider = this.parentContainer["providers"].get(key);

      if (parentProvider) {
        if (parentProvider.scope === "scoped") {
          if (!this.scopedInstances.has(key)) {
            this.scopedInstances.set(key, parentProvider.factory(this));
          }
          return this.scopedInstances.get(key);
        } else {
          return this.parentContainer.inject<T>(key);
        }
      }
    }

    throw new Error(`Service '${key}' not registered.`);
  }

  createChild(): DIContainer {
    return new DIContainer(this);
  }
}
