import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exercise, ExerciseSchema } from '../../schemas/exercise.schema';
import { ExerciseLog, ExerciseLogSchema } from '../../schemas/exercise-log.schema';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      { name: ExerciseLog.name, schema: ExerciseLogSchema },
    ]),
  ],
  providers: [ExercisesService],
  controllers: [ExercisesController],
})
export class ExercisesModule {}
