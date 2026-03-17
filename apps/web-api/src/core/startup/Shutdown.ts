import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { ShutdownConfig } from "../../configs/ShutdownConfig";

export function Shutdown(httpServer: HttpServer, socketIOServer: SocketIOServer, config: ShutdownConfig = {}): void {
  const SHUTDOWN_TIMEOUT = config.timeout ?? 10000;

  const gracefulShutdown = (signal: string) => {
    console.log(`\n\n📍 [${signal}] Shutting down...`);

    httpServer.close(() => {
      console.log("HTTP server closed");

      socketIOServer.close();
      console.log("Socket.io closed");

      console.log("Application shutdown complete");
      process.exit(0);
    });

    setTimeout(() => {
      console.error(`Could not close connections in time (${SHUTDOWN_TIMEOUT}ms), forcing shutdown`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
 