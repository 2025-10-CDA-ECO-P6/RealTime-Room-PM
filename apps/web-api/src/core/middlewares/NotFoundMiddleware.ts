import { Request, Response } from "express";

export function NotFoundMiddleware(_req: Request, res: Response): void {
  if (res.headersSent) {
    return;
  }

  res.status(404).json({
    error: "Route not found",
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
}
