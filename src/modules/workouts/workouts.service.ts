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

  /**
   * Catalog list for the training flow. Filter by workout type and/or muscle
   * group and/or goal. Returns lightweight cards (no heavy section data).
   */
  async findCatalog(filter: { workoutTypeId?: string; muscleGroupId?: string; goal?: string }) {
    const select =
      'name imageUrl description duration caloriesKcal difficulty goal levelLabel ' +
      'creatorType creatorName rating ratingCount timesCompleted totalSets ' +
      'targetMuscleLabel targetMusclePercent popularity';

    const build = (withMuscle: boolean) => {
      const q: any = { isCatalog: true };
      if (filter.workoutTypeId) q.workoutTypeId = filter.workoutTypeId;
      if (withMuscle && filter.muscleGroupId) q.muscleGroupId = filter.muscleGroupId;
      if (filter.goal) q.goal = filter.goal;
      return q;
    };

    let docs = await this.workoutModel
      .find(build(true))
      .select(select)
      .sort({ popularity: -1, rating: -1 })
      .exec();

    // Fallback: muscle has no dedicated workout yet → show the type's workouts
    // so the flow never dead-ends on an empty list.
    if (docs.length === 0 && filter.muscleGroupId && filter.workoutTypeId) {
      docs = await this.workoutModel
        .find(build(false))
        .select(select)
        .sort({ popularity: -1, rating: -1 })
        .exec();
    }

    return docs;
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
          // Per-item prescription (Workout Details rows)
          setsLabel: item.setsLabel || null,
          repsLabel: item.repsLabel || (item.reps ? `${item.reps} Reps` : null),
          restLabel: item.restLabel || (item.restSeconds ? `${item.restSeconds}s` : null),
          tempo: item.tempo || null,
          rpe: item.rpe ?? null,
          weightLabel: item.weightLabel || null,
          note: item.note || null,
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
      // Header chips + social proof
      goal: workoutObj.goal || null,
      levelLabel: workoutObj.levelLabel || workoutObj.difficulty || null,
      creator: {
        type: workoutObj.creatorType || null,
        name: workoutObj.creatorName || null,
      },
      rating: workoutObj.rating ?? null,
      ratingCount: workoutObj.ratingCount ?? null,
      timesCompleted: workoutObj.timesCompleted ?? null,
      stats: {
        durationMinutes: workoutObj.duration ?? null,
        caloriesKcal: workoutObj.caloriesKcal ?? null,
        difficulty: workoutObj.difficulty || null,
        totalSets: workoutObj.totalSets ?? null,
      },
      target: workoutObj.targetMuscleLabel
        ? {
            label: workoutObj.targetMuscleLabel,
            percent: workoutObj.targetMusclePercent ?? null,
          }
        : null,
      equipment: {
        totalItems: equipmentItems.length,
        items: equipmentItems,
        required: equipmentItems.filter((e: any) => !e.optional),
        optional: equipmentItems.filter((e: any) => !!e.optional),
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
