import { createApp } from "./src/app";
import { StartupMessageConfig } from "./src/configs/StartupMessageConfig";
import config from "./src/configs/Config";
import { ServicesRegistrationExtension, SocketExtension } from "./src/core/extensions";
import { ErrorHandlers } from "./src/core/startup/ErrorHandlers";
import { Shutdown } from "./src/core/startup/Shutdown";
import { StartupMessage } from "./src/core/startup/StartupMessage";
import { DIContainer } from "packages/shared/di/src/DIContainer";
import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { AppConfigInitial } from "./src/configs/AppConfig";

async function bootstrap(): Promise<void> {
  try {
    console.log("[Bootstrap] Starting application...\n");

    // ========== STEP 1: CREATE EXPRESS APP ==========
    console.log("[Bootstrap] Creating Express Application...");
    const container: DIContainer = new DIContainer();
    const appConfig: AppConfigInitial = {
      container,
      socketServer: undefined,
    };
    const app = createApp(appConfig);

    // ========== STEP 2: START HTTP SERVER ==========
    console.log("[Bootstrap] Starting HTTP Server...");
    const httpServer: HttpServer = app.listen(config.port, () => {
      console.log(`[HTTP] Server listening on port ${config.port}`);
    });

    // ========== STEP 3: CREATE SOCKET.IO (LAZY-LOAD) ==========
    console.log("[Bootstrap] Creating Socket.io...");
    const socketIOServer: SocketIOServer = SocketExtension(httpServer, container);

    // ========== STEP 4: REGISTER ALL SERVICES (MUTATE container) ==========
    // ✅ ServicesRegistrationExtension doit MUTATER le container existant
    // et pas créer un nouveau container
    console.log("[Bootstrap] Registering Services...");
    ServicesRegistrationExtension(container, socketIOServer);

    // ========== STEP 5: DISPLAY STATUS ==========
    const startupConfig: StartupMessageConfig = {
      port: config.port,
      nodeEnv: config.nodeEnv,
      socketIoPath: config.socketIoPath,
      cors: config.cors,
    };
    StartupMessage(startupConfig);

    // ========== STEP 6: GRACEFUL SHUTDOWN ==========
    Shutdown(httpServer, socketIOServer, { timeout: 10000 });

    // ========== STEP 7: ERROR HANDLERS ==========
    ErrorHandlers();
  } catch (error) {
    console.error("❌ [Bootstrap] Failed to start application:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// ========== START APPLICATION ==========
(async () => {
  await bootstrap();
})().catch((error) => {
  console.error("❌ [Bootstrap] Fatal error:", error);
  process.exit(1);
});
 