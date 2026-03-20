import { createApp } from "./app";
import { StartupMessageConfig } from "./configs/StartupMessageConfig";
import config from "./configs/Config";
import { ServicesRegistrationExtension, SocketExtension } from "./core/extensions";
import { ErrorHandlers } from "./core/startup/ErrorHandlers";
import { Shutdown } from "./core/startup/Shutdown";
import { StartupMessage } from "./core/startup/StartupMessage";
import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { AppConfigInitial } from "./configs/AppConfig";

import { DIContainer } from "@repo/di";
import { bootstrapSocketModules } from "./bootstrapSocketModules";
import { bootstrapTurnModules } from "./bootstrapTurnModules";

async function bootstrap(): Promise<void> {
  try {
    const container: DIContainer = new DIContainer();
    const appConfig: AppConfigInitial = {
      container,
      socketServer: undefined,
    };

    const app = createApp(appConfig);

    const httpServer: HttpServer = app.listen(config.port, () => {
      console.log(`[HTTP] Server listening on port ${config.port}`);
    });

    const socketIOServer: SocketIOServer = SocketExtension(httpServer);

    ServicesRegistrationExtension(container, socketIOServer);
    bootstrapTurnModules(container);
    bootstrapSocketModules(container);

    const startupConfig: StartupMessageConfig = {
      port: config.port,
      nodeEnv: config.nodeEnv,
      socketIoPath: config.socketIoPath,
      cors: config.cors,
    };

    StartupMessage(startupConfig);
    Shutdown(httpServer, socketIOServer, { timeout: 10000 });
    ErrorHandlers();
  } catch (error) {
    console.error("❌ [Bootstrap] Failed to start application:", error);

    if (error instanceof Error) {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

async function main(): Promise<void> {
  try {
    await bootstrap();
  } catch (error) {
    console.error("❌ [Bootstrap] Fatal error:", error);
    process.exit(1);
  }
}

main();
