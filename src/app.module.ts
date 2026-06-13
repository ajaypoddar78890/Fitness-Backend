import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { FitnessTrackingModule } from './modules/fitness-tracking/fitness-tracking.module';
import { FitnessActivityModule } from './modules/fitness-activity/fitness-activity.module';
import { WorkoutTypesModule } from './modules/workout-types/workout-types.module';
import { MuscleGroupsModule } from './modules/muscle-groups/muscle-groups.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { ExerciseLogsModule } from './modules/exercise-logs/exercise-logs.module';
import { AiTrainerModule } from './modules/ai-trainer/ai-trainer.module';
import { SavedWorkoutsModule } from './modules/saved-workouts/saved-workouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_app'),
    AuthModule,
    UsersModule,
    WorkoutsModule,
    NutritionModule,
    FitnessTrackingModule,
    FitnessActivityModule,
    WorkoutTypesModule,
    MuscleGroupsModule,
    ExercisesModule,
    ExerciseLogsModule,
    AiTrainerModule,
    SavedWorkoutsModule,
  ],
})
export class AppModule {}
