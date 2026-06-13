import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FitnessActivity,
  FitnessActivitySchema,
} from '../../schemas/fitness-activity.schema';
import { FitnessActivityService } from './fitness-activity.service';
import { FitnessActivityController } from './fitness-activity.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FitnessActivity.name, schema: FitnessActivitySchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  providers: [FitnessActivityService],
  controllers: [FitnessActivityController],
  exports: [FitnessActivityService],
})
export class FitnessActivityModule {}
