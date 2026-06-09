import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiTrainerService } from './ai-trainer.service';
import { AiTrainerController } from './ai-trainer.controller';
import { Conversation, ConversationSchema } from '../../schemas/conversation.schema';
import { OpenaiService } from '../../services/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
  ],
  providers: [AiTrainerService, OpenaiService],
  controllers: [AiTrainerController],
  exports: [AiTrainerService],
})
export class AiTrainerModule {}
