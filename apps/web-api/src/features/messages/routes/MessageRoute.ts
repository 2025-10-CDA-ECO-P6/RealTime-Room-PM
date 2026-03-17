import { Router, Request, Response } from "express";
import { MessageController } from "../controllers/MessageController";
import { DIContainer } from "packages/shared/di/src/DIContainer";

const router = Router();


const getMessageController = (req: Request): MessageController => {
  const container = (req as any).container as DIContainer;
  return container.inject<MessageController>("MessageController");
};


router.post("/", async (req: Request, res: Response) => {
  const controller = getMessageController(req);
  await controller.sendMessage(req, res);
});

export default router;
