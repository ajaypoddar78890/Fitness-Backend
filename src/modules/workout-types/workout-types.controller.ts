import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WorkoutTypesService } from './workout-types.service';
import { CreateWorkoutTypeDto } from './dto/workout-type.dto';

@Controller('workout-types')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class WorkoutTypesController {
  constructor(private readonly workoutTypesService: WorkoutTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkoutTypeDto) {
    try {
      const data = await this.workoutTypesService.create(dto);
      return { success: true, data };
    } catch (err) {
      throw new BadRequestException({ success: false, message: err.message });
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      const data = await this.workoutTypesService.findAll();
      return { success: true, data };
    } catch (err) {
      throw new BadRequestException({ success: false, message: err.message });
    }
  }
}
