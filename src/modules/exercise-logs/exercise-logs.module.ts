import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseLog, ExerciseLogSchema } from '../../schemas/exercise-log.schema';
import { ExerciseLogsService } from './exercise-logs.service';
import { ExerciseLogsController } from './exercise-logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExerciseLog.name, schema: ExerciseLogSchema }]),
  ],
  providers: [ExerciseLogsService],
  controllers: [ExerciseLogsController],
})
export class ExerciseLogsModule {}
