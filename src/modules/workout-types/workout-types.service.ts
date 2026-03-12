import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkoutType, WorkoutTypeDocument } from '../../schemas/workout-type.schema';
import { CreateWorkoutTypeDto } from './dto/workout-type.dto';

@Injectable()
export class WorkoutTypesService {
  constructor(
    @InjectModel(WorkoutType.name) private workoutTypeModel: Model<WorkoutTypeDocument>,
  ) {}

  async create(dto: CreateWorkoutTypeDto): Promise<WorkoutType> {
    return this.workoutTypeModel.create(dto);
  }

  async findAll(): Promise<WorkoutType[]> {
    return this.workoutTypeModel.find().exec();
  }
}
