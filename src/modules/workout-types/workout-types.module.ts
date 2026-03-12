import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutType, WorkoutTypeSchema } from '../../schemas/workout-type.schema';
import { WorkoutTypesService } from './workout-types.service';
import { WorkoutTypesController } from './workout-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkoutType.name, schema: WorkoutTypeSchema }]),
  ],
  providers: [WorkoutTypesService],
  controllers: [WorkoutTypesController],
})
export class WorkoutTypesModule {}
