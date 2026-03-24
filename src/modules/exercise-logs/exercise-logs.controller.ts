import {
  Controller,
  Post,
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
import { ExerciseLogsService } from './exercise-logs.service';
import { CreateExerciseLogDto, UpdateExerciseLogDto } from './dto/exercise-log.dto';

@Controller('exercise-logs')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ExerciseLogsController {
  constructor(private readonly exerciseLogsService: ExerciseLogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateExerciseLogDto) {
    try {
      const data = await this.exerciseLogsService.create(dto);
      return { success: true, data };
    } catch (err) {
      throw new BadRequestException({ success: false, message: err.message });
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateExerciseLogDto) {
    try {
      const data = await this.exerciseLogsService.update(id, dto);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Exercise log not found' });
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
      const data = await this.exerciseLogsService.remove(id);
      if (!data) {
        throw new NotFoundException({ success: false, message: 'Exercise log not found' });
      }
      return { success: true, data };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException({ success: false, message: err.message });
    }
  }
}
