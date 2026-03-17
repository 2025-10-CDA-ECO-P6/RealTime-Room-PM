import { Request, Response, NextFunction } from "express";

export function RequestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const method = req.method.padEnd(6);
  const url = req.originalUrl;

  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const timestamp = new Date().toLocaleString("fr-FR");

    console.log(`[${timestamp}] ${method} ${url} ${status} ${duration}ms`);
    return originalJson(body);
  };

  next();
}
