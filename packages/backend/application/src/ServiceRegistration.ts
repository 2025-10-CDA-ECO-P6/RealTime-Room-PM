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
  StartTurnUseCase,
  ISubmitVoteUseCase,
  SubmitVoteUseCase,
  IJoinTurnPlayerUseCase,
  JoinTurnPlayerUseCase,
  ILeaveTurnPlayerUseCase,
  LeaveTurnPlayerUseCase,
  ITickTurnUseCase,
  TickTurnUseCase,
} from "./features";

export function registerApplicationServices(container: DIContainer): void {
  container.scoped<ISendMessageUseCase>("SendMessageUseCase", (c: DIContainer) => {
    const messagePublisher = c.inject<IMessagePublisher>("MessagePublisher");
    return new SendMessageUseCase(messagePublisher);
  });

  container.scoped<IStartTurnUseCase>("StartTurnUseCase", (c: DIContainer) => {
    return new StartTurnUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
    );
  });

  container.scoped<ISubmitVoteUseCase>("SubmitVoteUseCase", (c: DIContainer) => {
    return new SubmitVoteUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
    );
  });

  container.scoped<IJoinTurnPlayerUseCase>("JoinTurnPlayerUseCase", (c: DIContainer) => {
    return new JoinTurnPlayerUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
    );
  });

  container.scoped<ILeaveTurnPlayerUseCase>("LeaveTurnPlayerUseCase", (c: DIContainer) => {
    return new LeaveTurnPlayerUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
    );
  });

  container.scoped<ITickTurnUseCase>("TickTurnUseCase", (c: DIContainer) => {
    return new TickTurnUseCase(
      c.inject<ITurnRepository>("TurnRepository"),
      c.inject<IClock>("Clock"),
      c.inject<IRandomChoicePolicy>("RandomChoicePolicy"),
      c.inject<ITurnStatePublisher>("TurnStatePublisher"),
    );
  });
}
