import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise, ExerciseDocument } from '../../schemas/exercise.schema';
import { ExerciseLog, ExerciseLogDocument } from '../../schemas/exercise-log.schema';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
    @InjectModel(ExerciseLog.name) private exerciseLogModel: Model<ExerciseLogDocument>,
  ) {}

  async create(dto: CreateExerciseDto): Promise<Exercise> {
    return this.exerciseModel.create(dto);
  }

  async findByMuscleGroup(muscleGroupId: string): Promise<Exercise[]> {
    return this.exerciseModel.find({ muscleGroupId }).exec();
  }

  async update(id: string, dto: UpdateExerciseDto): Promise<Exercise | null> {
    return this.exerciseModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<Exercise | null> {
    return this.exerciseModel.findByIdAndDelete(id).exec();
  }

  async findByIdWithDetails(id: string) {
    const exercise = await this.exerciseModel
      .findById(id)
      .populate('muscleGroupId', 'label')
      .populate('workoutTypeId', 'label')
      .exec();

    if (!exercise) {
      return null;
    }

    const recentLogs = await this.exerciseLogModel
      .find({ exerciseId: id })
      .sort({ date: -1 })
      .limit(10)
      .exec();

    const prLog = await this.exerciseLogModel
      .findOne({ exerciseId: id, weightKg: { $exists: true, $ne: null } })
      .sort({ weightKg: -1 })
      .exec();

    const exerciseObj: any = exercise.toObject();

    return {
      ...exerciseObj,
      details: {
        imageUrl: exerciseObj.imageUrl || null,
        summary: exerciseObj.summary || null,
        equipment: exerciseObj.equipment || null,
        equipmentDetails: exerciseObj.equipmentDetails || null,
        techniqueSteps:
          Array.isArray(exerciseObj.techniqueSteps) && exerciseObj.techniqueSteps.length > 0
            ? exerciseObj.techniqueSteps
            : exerciseObj.instructions
              ? [exerciseObj.instructions]
              : [],
      },
      recentLogs,
      personalRecord: prLog
        ? {
            weightKg: prLog.weightKg,
            logId: prLog._id,
            date: prLog.date,
          }
        : null,
    };
  }
}
