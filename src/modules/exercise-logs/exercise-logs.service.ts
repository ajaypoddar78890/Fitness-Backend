import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExerciseLog, ExerciseLogDocument } from '../../schemas/exercise-log.schema';
import { CreateExerciseLogDto, UpdateExerciseLogDto } from './dto/exercise-log.dto';

@Injectable()
export class ExerciseLogsService {
  constructor(
    @InjectModel(ExerciseLog.name) private exerciseLogModel: Model<ExerciseLogDocument>,
  ) {}

  async create(dto: CreateExerciseLogDto): Promise<ExerciseLog> {
    const saved = await this.exerciseLogModel.create(dto);

    if (dto.weightKg != null) {
      const prLog = await this.exerciseLogModel
        .findOne({
          exerciseId: dto.exerciseId,
          userId: dto.userId,
          weightKg: { $exists: true, $ne: null },
        })
        .sort({ weightKg: -1 })
        .exec();

      if (prLog && prLog.weightKg <= dto.weightKg) {
        await this.exerciseLogModel.updateOne({ _id: saved._id }, { isPersonalRecord: true });
        return this.exerciseLogModel.findById(saved._id).exec();
      }
    }

    return saved;
  }

  async update(id: string, dto: UpdateExerciseLogDto): Promise<ExerciseLog | null> {
    return this.exerciseLogModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<ExerciseLog | null> {
    return this.exerciseLogModel.findByIdAndDelete(id).exec();
  }
}
