import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiTrainerService } from './ai-trainer.service';
import { RespondToQuestionDto, StartConversationDto } from './dto/ai-trainer.dto';

@Controller('ai-trainer')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AiTrainerController {
  constructor(private readonly svc: AiTrainerService) {}

  /**
   * POST /ai-trainer/start
   * Body: { userId, message }
   * Starts a conversation and returns the first question.
   */
  @Post('start')
  async start(@Body() body: StartConversationDto) {
    const data = await this.svc.startConversation(body.userId, body.message ?? 'Generate');
    return { success: true, data };
  }

  /**
   * POST /ai-trainer/respond
   * Body: { userId, selectedOption }
   * Records an answer and returns the next question or the generated workout.
   */
  @Post('respond')
  async respond(@Body() body: RespondToQuestionDto) {
    const data = await this.svc.respondToQuestion(body.userId, body.selectedOption);
    return { success: true, data };
  }
}
