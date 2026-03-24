import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WorkoutTypesService } from './workout-types.service';
import { CreateWorkoutTypeDto, UpdateWorkoutTypeDto } from './dto/workout-type.dto';

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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateWorkoutTypeDto) {
    try {
      const data = await this.workoutTypesService.update(id, dto);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Workout type not found' });
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
      const data = await this.workoutTypesService.remove(id);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Workout type not found' });
      }
      return { success: true, data };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException({ success: false, message: err.message });
    }
  }
}
