import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';

@Controller('exercises')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateExerciseDto) {
    try {
      const data = await this.exercisesService.create(dto);
      return { success: true, data };
    } catch (err) {
      throw new BadRequestException({ success: false, message: err.message });
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findByMuscleGroup(@Query('muscleGroupId') muscleGroupId: string) {
    try {
      const data = await this.exercisesService.findByMuscleGroup(muscleGroupId);
      return { success: true, data };
    } catch (err) {
      throw new BadRequestException({ success: false, message: err.message });
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    try {
      const data = await this.exercisesService.findByIdWithDetails(id);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Exercise not found' });
      }
      return { success: true, data };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException({ success: false, message: err.message });
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    try {
      const data = await this.exercisesService.update(id, dto);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Exercise not found' });
      }
      return { success: true, data };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException({ success: false, message: err.message });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      const data = await this.exercisesService.remove(id);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Exercise not found' });
      }
      return { success: true, data };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException({ success: false, message: err.message });
    }
  }
}
