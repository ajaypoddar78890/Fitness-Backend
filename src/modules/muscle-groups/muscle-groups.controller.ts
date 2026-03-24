import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MuscleGroupsService } from './muscle-groups.service';
import { CreateMuscleGroupDto, UpdateMuscleGroupDto } from './dto/muscle-group.dto';

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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateMuscleGroupDto) {
    try {
      const data = await this.muscleGroupsService.update(id, dto);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Muscle group not found' });
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
      const data = await this.muscleGroupsService.remove(id);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Muscle group not found' });
      }
      return { success: true, data };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException({ success: false, message: err.message });
    }
  }
}
