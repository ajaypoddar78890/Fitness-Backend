import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedWorkoutsService } from './saved-workouts.service';
import { SavedWorkoutsController } from './saved-workouts.controller';
import { SavedWorkout, SavedWorkoutSchema } from '../../schemas/saved-workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SavedWorkout.name, schema: SavedWorkoutSchema }]),
  ],
  providers: [SavedWorkoutsService],
  controllers: [SavedWorkoutsController],
  exports: [SavedWorkoutsService],
})
export class SavedWorkoutsModule {}
