import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workout, WorkoutDocument } from '../../schemas/workout.schema';

@Injectable()
export class WorkoutsService {
  constructor(@InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>) {}

  create(data: any) {
    return this.workoutModel.create(data);
  }

  findByUser(userId: string) {
    return this.workoutModel.find({ user: userId }).exec();
  }

  findById(id: string) {
    return this.workoutModel.findById(id).exec();
  }

  update(id: string, data: any) {
    return this.workoutModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  remove(id: string) {
    return this.workoutModel.findByIdAndDelete(id).exec();
  }
}
