import { Server as SocketIOServer } from "socket.io";
import { registerWebApiServices } from "../../ServiceRegistration";

import { DIContainer } from "@repo/di";
import { registerDomainServices } from "@repo/backend-domain";
import { registerApplicationServices } from "@repo/backend-application";
import { registerInfrastructureServices } from "@repo/backend-infrastructure";

export function ServicesRegistrationExtension(container: DIContainer, socketIOServer: SocketIOServer): void {
  registerDomainServices(container);
  registerApplicationServices(container);
  registerInfrastructureServices(container, socketIOServer);
  registerWebApiServices(container);
}
