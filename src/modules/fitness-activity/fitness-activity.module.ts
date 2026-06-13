import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FitnessActivity,
  FitnessActivitySchema,
} from '../../schemas/fitness-activity.schema';
import {
  FitnessGoal,
  FitnessGoalSchema,
} from '../../schemas/fitness-goal.schema';
import { FitnessActivityService } from './fitness-activity.service';
import { FitnessActivityController } from './fitness-activity.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FitnessActivity.name, schema: FitnessActivitySchema },
      { name: FitnessGoal.name, schema: FitnessGoalSchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  providers: [FitnessActivityService],
  controllers: [FitnessActivityController],
  exports: [FitnessActivityService],
})
export class FitnessActivityModule {}
