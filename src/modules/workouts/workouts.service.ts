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

  async findWorkoutScreenById(id: string) {
    const workout = await this.workoutModel
      .findById(id)
      .populate({
        path: 'sections.items.exerciseId',
        select: 'name imageUrl equipment equipmentDetails difficulty durationSeconds techniqueSteps',
      })
      .exec();

    if (!workout) {
      return null;
    }

    const workoutObj: any = workout.toObject();
    const sections = Array.isArray(workoutObj.sections) ? workoutObj.sections : [];

    const mappedSections = sections.map((section: any) => {
      const items = Array.isArray(section.items) ? section.items : [];
      const mappedItems = items.map((item: any) => {
        if (item.type === 'rest') {
          return {
            type: 'rest',
            title: item.title || 'Rest',
            durationLabel: item.durationLabel || (item.restSeconds ? `${item.restSeconds}s` : null),
            restSeconds: item.restSeconds ?? null,
          };
        }

        const exercise = item.exerciseId;
        return {
          type: 'exercise',
          exerciseId: exercise?._id || item.exerciseId || null,
          title: item.title || exercise?.name || null,
          thumbnailUrl: item.thumbnailUrl || exercise?.imageUrl || null,
          durationLabel: item.durationLabel || (exercise?.durationSeconds ? `${exercise.durationSeconds}s` : null),
          reps: item.reps ?? null,
          showInfoIcon: item.showInfoIcon !== false,
          equipment: exercise?.equipment || null,
          equipmentDetails: exercise?.equipmentDetails || null,
          difficulty: exercise?.difficulty || null,
        };
      });

      return {
        title: section.title,
        totalExercises:
          section.totalExercises ?? mappedItems.filter((item: any) => item.type === 'exercise').length,
        totalMinutes: section.totalMinutes ?? null,
        items: mappedItems,
      };
    });

    const equipmentItems = Array.isArray(workoutObj.equipmentItems) ? workoutObj.equipmentItems : [];

    return {
      _id: workoutObj._id,
      name: workoutObj.name,
      imageUrl: workoutObj.imageUrl || null,
      description: workoutObj.description || null,
      stats: {
        durationMinutes: workoutObj.duration ?? null,
        caloriesKcal: workoutObj.caloriesKcal ?? null,
        difficulty: workoutObj.difficulty || null,
      },
      equipment: {
        totalItems: equipmentItems.length,
        items: equipmentItems,
      },
      actions: {
        canScheduleWorkout: true,
        canPickPlaylist: true,
        playlistUrl: workoutObj.playlistUrl || null,
        scheduledAt: workoutObj.scheduledAt || null,
      },
      sections: mappedSections,
    };
  }

  update(id: string, data: any) {
    return this.workoutModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  remove(id: string) {
    return this.workoutModel.findByIdAndDelete(id).exec();
  }
}
