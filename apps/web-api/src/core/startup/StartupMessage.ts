import { StartupMessageConfig } from "../../configs/StartupMessageConfig";

export function StartupMessage(config: StartupMessageConfig): void {
  const corsOrigins = Array.isArray(config.cors.origin) ? config.cors.origin.join(", ") : config.cors.origin;

  console.log(`

SERVER STARTED

  Server Running on Port:    ${String(config.port).padEnd(27)}
  Environment:               ${config.nodeEnv.padEnd(34)}
  Socket.io Path:            ${config.socketIoPath.padEnd(31)}
  CORS Origins:              ${corsOrigins.padEnd(32)}

  `);
}
