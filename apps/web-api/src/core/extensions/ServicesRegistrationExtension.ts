import { DIContainer } from "packages/shared/di/src/DIContainer";
import { Server as SocketIOServer } from "socket.io";
import { registerApplicationServices } from "packages/backend/application/src/ServiceRegistration";
import { registerDomainServices } from "packages/backend/domain/src/ServiceRegistration";
import { registerInfrastructureServices } from "packages/backend/infrastructure/src/ServiceRegistration";
import { registerWebApiServices } from "../../ServiceRegistration";

export function ServicesRegistrationExtension(container: DIContainer, socketIOServer: SocketIOServer): void {
  console.log("[Services] Setting up DI Container...");

  console.log("[Services] Registering Domain Services...");
  registerDomainServices(container);

  console.log("[Services] Registering Application Services...");
  registerApplicationServices(container);

  console.log("[Services] Registering Infrastructure Services...");
  registerInfrastructureServices(container);

  console.log("[Services] Registering Web-API Services...");
  registerWebApiServices(container, socketIOServer);

  console.log("[Services] ✅ All services registered");
}