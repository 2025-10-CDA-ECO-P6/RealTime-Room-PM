import { Request, Response } from "express";
import { SendMessageDTO } from "packages/backend/application/src/features/messages/dtos/SendMessageDTO";
import { SendMessageUseCase } from "packages/backend/application/src/features/messages/use-cases/SendMessageUseCase";

export class MessageController {
  constructor(private readonly sendMessageUseCase: SendMessageUseCase) {}

  /**
   * POST /api/messages
   * Envoie un nouveau message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { userId, content } = req.body;

      // Validation basique
      if (!userId || !content) {
        res.status(400).json({
          error: "userId and content are required",
        });
        return; // ✅ Return ajouté
      }

      const dto: SendMessageDTO = { userId, content };
      const result = this.sendMessageUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
      return; // ✅ Return ajouté
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: message,
      });
      return; // ✅ Return ajouté
    }
  }
}
