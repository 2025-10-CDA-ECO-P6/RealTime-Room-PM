import express, { Express } from "express";
import { AppConfig } from "./configs/AppConfig";
import {
  CorsMiddleware,
  ErrorHandlerMiddleware,
  NotFoundMiddleware,
  RequestLoggerMiddleware,
} from "./core/middlewares";
import { DependencyInjectionExtension, HealthRoutesExtension, RequestContextExtension } from "./core/extensions";

export function createApp(appConfig: AppConfig): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(RequestLoggerMiddleware);
  app.use(CorsMiddleware);

  app.use(DependencyInjectionExtension(appConfig.container, appConfig.socketServer));
  app.use(RequestContextExtension());
  app.use(HealthRoutesExtension());
  
  app.use(ErrorHandlerMiddleware);
  app.use(NotFoundMiddleware);

  return app;
}
