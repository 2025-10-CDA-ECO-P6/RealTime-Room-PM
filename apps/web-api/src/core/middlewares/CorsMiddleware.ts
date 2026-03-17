import { Request, Response, NextFunction } from "express";
import config from "../../configs/Config";

export function CorsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.url?.startsWith("/socket.io")) {
    return next();
  }

  const origin = req.headers.origin;
  const configOrigin = config.cors.origin;

  const allowedOrigins = Array.isArray(configOrigin) ? configOrigin : [configOrigin];
  const isAllowed = allowedOrigins.includes("*") || allowedOrigins.includes(origin as string);

  if (isAllowed || config.nodeEnv === "development") {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(200).end();
  }
}
