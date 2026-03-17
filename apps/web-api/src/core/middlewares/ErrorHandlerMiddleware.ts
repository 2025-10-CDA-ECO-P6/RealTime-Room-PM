import { Request, Response, NextFunction } from "express";
import { AppError } from "../extensions";

export function ErrorHandlerMiddleware(err: Error | AppError, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    console.error("[Error] Headers already sent:", err);
    return;
  }

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.error(`[${statusCode}] ${message}`, {
    name: err.name,
    stack: err.stack,
  });

  res.status(statusCode).json({
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

