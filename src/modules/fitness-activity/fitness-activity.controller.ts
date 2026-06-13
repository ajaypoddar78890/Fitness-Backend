import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Put } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { FitnessActivityService } from './fitness-activity.service';
import { CreateFitnessActivityDto, UpdateGoalsDto } from './dto/fitness-activity.dto';

@Controller('fitness-activity')
@UseGuards(JwtAuthGuard)
export class FitnessActivityController {
  constructor(private readonly service: FitnessActivityService) {}

  // GET /fitness-activity/date/:date  -> selected day data
  @Get('date/:date')
  async getByDate(@Request() req, @Param('date') date: string) {
    const data = await this.service.getByDate(req.user.uid, date);
    return { success: true, data };
  }

  // GET /fitness-activity/week  -> last 7 days + averages + streak
  // optional ?end=YYYY-MM-DD to anchor the week on a specific day
  @Get('week')
  async getWeek(@Request() req, @Query('end') end?: string) {
    const data = await this.service.getWeek(req.user.uid, end);
    return { success: true, data };
  }

  // GET /fitness-activity/goals  -> user's daily targets (defaults if unset)
  @Get('goals')
  async getGoals(@Request() req) {
    const data = await this.service.getGoals(req.user.uid);
    return { success: true, data };
  }

  // PUT /fitness-activity/goals  -> create/update daily targets
  @Put('goals')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateGoals(@Request() req, @Body() dto: UpdateGoalsDto) {
    const data = await this.service.updateGoals(req.user.uid, dto);
    return { success: true, data };
  }

  // POST /fitness-activity  -> create/upsert a day record
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Request() req, @Body() dto: CreateFitnessActivityDto) {
    const data = await this.service.create(req.user.uid, dto);
    return { success: true, data };
  }
}
