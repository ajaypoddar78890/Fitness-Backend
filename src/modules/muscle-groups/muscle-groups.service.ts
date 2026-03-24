import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MuscleGroup, MuscleGroupDocument } from '../../schemas/muscle-group.schema';
import { CreateMuscleGroupDto, UpdateMuscleGroupDto } from './dto/muscle-group.dto';

@Injectable()
export class MuscleGroupsService {
  constructor(
    @InjectModel(MuscleGroup.name) private muscleGroupModel: Model<MuscleGroupDocument>,
  ) {}

  async create(dto: CreateMuscleGroupDto): Promise<MuscleGroup> {
    return this.muscleGroupModel.create(dto);
  }

  async findByWorkoutType(workoutTypeId: string): Promise<MuscleGroup[]> {
    return this.muscleGroupModel.find({ workoutTypeId }).exec();
  }

  async update(id: string, dto: UpdateMuscleGroupDto): Promise<MuscleGroup | null> {
    return this.muscleGroupModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<MuscleGroup | null> {
    return this.muscleGroupModel.findByIdAndDelete(id).exec();
  }
}
