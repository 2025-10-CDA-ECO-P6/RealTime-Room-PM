import { SendMessageUseCase } from "./features/messages/use-cases/SendMessageUseCase";
import { ISendMessageUseCase } from "./features/messages/interfaces/ISendMessageUseCase";
import {
  IClock,
  IMessagePublisher,
  IRandomChoicePolicy,
  ITurnRepository,
  ITurnStatePublisher,
} from "@repo/backend-domain";
import { DIContainer } from "@repo/di";
import {
  IStartTurnUseCase,
  ISubmitVoteUseCase,
  IJoinTurnPlayerUseCase,
  ILeaveTurnPlayerUseCase,
  ITickTurnUseCase,
  IGameFlowPolicy,
  IRoomPresenceReader,
  ITurnActionComposer,
  ITurnActionRegistry,
  ITurnActionResolverRegistry,
  ITurnCycleOrchestrator,
  ITurnScheduler,
  TurnActionComposer,
  TurnActionRegistry,
  TurnActionResolverRegistry,
  TurnCycleOrchestrator,
  IStartGameUseCase,
  StartGameUseCase,
  JoinTurnPlayerUseCase,
  LeaveTurnPlayerUseCase,
  StartTurnUseCase,
  SubmitVoteUseCase,
  TickTurnUseCase,
} from "./core";

import { DefaultGameFlowPolicy } from "./core/services/DefaultGameFlowPolicy";

export function registerApplicationServices(container: DIContainer): void {
  container.singleton<ITurnActionRegistry>("TurnActionRegistry", () => {
    return new TurnActionRegistry();
  });

  container.singleton<ITurnActionComposer>("TurnActionComposer", (c: DIContainer) => {
    return new TurnActionComposer(c.inject<ITurnActionRegistry>("TurnActionRegistry"));
  });

  container.singleton<ITurnActionResolverRegistry>("TurnActionResolverRegistry", () => {
    return new TurnActionResolverRegistry();
  });

  container.singleton<IGameFlowPolicy>("GameFlowPolicy", () => {
    return new DefaultGameFlowPolicy({
      decisionDurationMs: 10000,
    });
  });

  container.singleton<ITurnCycleOrchestrator>("TurnCycleOrchestrator", (c: DIContainer) => {
    return new TurnCycleOrchestrator(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
      c.inject<IClock>("Clock"),
      c.inject<IRandomChoicePolicy>("RandomChoicePolicy"),
      c.inject<IRoomPresenceReader>("RoomPresenceReader"),
      c.inject<ITurnScheduler>("TurnScheduler"),
      c.inject<ITurnActionComposer>("TurnActionComposer"),
      c.inject<ITurnActionResolverRegistry>("TurnActionResolverRegistry"),
      c.inject<IGameFlowPolicy>("GameFlowPolicy"),
    );
  });

  container.scoped<ISendMessageUseCase>("SendMessageUseCase", (c: DIContainer) => {
    return new SendMessageUseCase(c.inject<IMessagePublisher>("MessagePublisher"));
  });

  container.scoped<IStartGameUseCase>("StartGameUseCase", (c: DIContainer) => {
    return new StartGameUseCase(c.inject<ITurnCycleOrchestrator>("TurnCycleOrchestrator"));
  });

  container.scoped<IStartTurnUseCase>("StartTurnUseCase", (c: DIContainer) => {
    return new StartTurnUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
      c.inject<ITurnCycleOrchestrator>("TurnCycleOrchestrator"),
    );
  });

  container.scoped<ISubmitVoteUseCase>("SubmitVoteUseCase", (c: DIContainer) => {
    return new SubmitVoteUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
      c.inject<ITurnCycleOrchestrator>("TurnCycleOrchestrator"),
    );
  });

  container.scoped<IJoinTurnPlayerUseCase>("JoinTurnPlayerUseCase", (c: DIContainer) => {
    return new JoinTurnPlayerUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
      c.inject<ITurnCycleOrchestrator>("TurnCycleOrchestrator"),
    );
  });

  container.scoped<ILeaveTurnPlayerUseCase>("LeaveTurnPlayerUseCase", (c: DIContainer) => {
    return new LeaveTurnPlayerUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
      c.inject<ITurnCycleOrchestrator>("TurnCycleOrchestrator"),
    );
  });

  container.scoped<ITickTurnUseCase>("TickTurnUseCase", (c: DIContainer) => {
    return new TickTurnUseCase(
      c.inject<ITurnCycleOrchestrator>("TurnCycleOrchestrator"),
      c.inject<ITurnRepository>("TurnRepository"),
    );
  });
}
