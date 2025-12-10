import { Module } from '@nestjs/common';
import { FitnessTrackingController } from './fitness-tracking.controller';
import { FirebaseService } from '../../services/firebase.service';

@Module({
  controllers: [FitnessTrackingController],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FitnessTrackingModule {}