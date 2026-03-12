import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MuscleGroupsService } from './muscle-groups.service';
import { CreateMuscleGroupDto } from './dto/muscle-group.dto';

@Controller('muscle-groups')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class MuscleGroupsController {
  constructor(private readonly muscleGroupsService: MuscleGroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMuscleGroupDto) {
    try {
      const data = await this.muscleGroupsService.create(dto);
      return { success: true, data };
    } catch (err) {
      throw new BadRequestException({ success: false, message: err.message });
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findByWorkoutType(@Query('workoutTypeId') workoutTypeId: string) {
    try {
      const data = await this.muscleGroupsService.findByWorkoutType(workoutTypeId);
      return { success: true, data };
    } catch (err) {
      throw new BadRequestException({ success: false, message: err.message });
    }
  }
}
