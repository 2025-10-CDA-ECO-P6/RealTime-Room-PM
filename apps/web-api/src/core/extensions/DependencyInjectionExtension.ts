import { DIContainer } from "@repo/di";
import { NextFunction, Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";

export interface RequestWithDI extends Request {
  container: DIContainer;
  socketServer: SocketIOServer;
}

export function DependencyInjectionExtension(container: DIContainer, socketServer?: SocketIOServer | null) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const reqWithDI = req as RequestWithDI;
    reqWithDI.container = container;

    if (socketServer) {
      reqWithDI.socketServer = socketServer;
    }

    next();
  };
}
