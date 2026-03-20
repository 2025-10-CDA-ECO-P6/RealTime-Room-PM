import { DIContainer } from "@repo/di";
import {
  ITurnActionRegistry,
  ITurnActionResolverRegistry,
  ITurnActionProvider,
  ITurnActionResolver,
  ITurnCycleOrchestrator,
} from "@repo/backend-application";
import { InMemoryTurnScheduler } from "@repo/backend-infrastructure";

export function bootstrapTurnModules(container: DIContainer): void {
  const turnActionRegistry = container.inject<ITurnActionRegistry>("TurnActionRegistry");
  const turnActionResolverRegistry = container.inject<ITurnActionResolverRegistry>("TurnActionResolverRegistry");

  const rpgActionProvider = container.inject<ITurnActionProvider>("DefaultRpgTurnActionProvider");
  const rpgActionResolver = container.inject<ITurnActionResolver>("DefaultRpgTurnActionResolver");

  turnActionRegistry.register(rpgActionProvider);
  turnActionResolverRegistry.register(rpgActionResolver);

  const scheduler = container.inject<InMemoryTurnScheduler>("InMemoryTurnScheduler");
  const orchestrator = container.inject<ITurnCycleOrchestrator>("TurnCycleOrchestrator");

  scheduler.attachOrchestrator(orchestrator);
}
