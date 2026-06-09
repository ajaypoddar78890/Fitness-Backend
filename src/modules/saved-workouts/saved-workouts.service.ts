import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { SavedWorkout, SavedWorkoutDocument } from '../../schemas/saved-workout.schema';
import { SaveWorkoutDto } from './dto/saved-workout.dto';

@Injectable()
export class SavedWorkoutsService {
  constructor(
    @InjectModel(SavedWorkout.name) private savedWorkoutModel: Model<SavedWorkoutDocument>,
  ) {}

  /**
   * Persist a generated workout. Defaults (status/version/completedSessions)
   * are set here so the caller only sends content.
   */
  async saveWorkout(userId: string, data: Omit<SaveWorkoutDto, 'userId'>) {
    const created = await this.savedWorkoutModel.create({
      userId,
      name: data.name,
      description: data.description ?? '',
      workoutPlan: data.workoutPlan,
      userPreferences: data.userPreferences,
      status: 'active',
      version: 1,
      completedSessions: 0,
    });
    return created;
  }

  /**
   * List a user's active workouts. Returns a lightweight summary suitable for
   * a list screen (name, version, completedSessions).
   */
  async getSavedWorkouts(userId: string) {
    return this.savedWorkoutModel
      .find({ userId, status: 'active' })
      .select('name description version completedSessions createdAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Full details for a single workout, scoped to the owning user. */
  async getWorkout(userId: string, workoutId: string) {
    if (!isValidObjectId(workoutId)) {
      throw new NotFoundException('Workout not found');
    }
    const workout = await this.savedWorkoutModel.findOne({ _id: workoutId, userId }).exec();
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }
    return workout;
  }
}
