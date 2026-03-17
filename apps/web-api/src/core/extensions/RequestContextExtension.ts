import { randomUUID } from "node:crypto";
import { Request, Response } from "express";

export interface RequestWithContext extends Request {
  context: {
    requestId: string;
    startTime: Date;
    userId?: string;
    metadata?: Record<string, any>;
  };
}

export function RequestContextExtension() {
    return (req: Request, _res: Response, next: Function) => {
      const context = {
        requestId: randomUUID(),
        startTime: new Date(),
      };

      (req as RequestWithContext).context = context;
      next();
    };
}
