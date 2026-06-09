import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SavedWorkoutsService } from './saved-workouts.service';
import { SaveWorkoutDto } from './dto/saved-workout.dto';

@Controller('saved-workouts')
export class SavedWorkoutsController {
  constructor(private readonly svc: SavedWorkoutsService) {}

  /**
   * POST /saved-workouts/save
   * Body: { userId, name, description, workoutPlan, userPreferences }
   */
  @Post('save')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async save(@Body() body: SaveWorkoutDto) {
    const { userId, ...workoutData } = body;
    const data = await this.svc.saveWorkout(userId, workoutData);
    return { success: true, data };
  }

  /**
   * GET /saved-workouts/list/:userId
   * Returns a user's active workouts (summary).
   */
  @Get('list/:userId')
  async list(@Param('userId') userId: string) {
    const data = await this.svc.getSavedWorkouts(userId);
    return { success: true, data };
  }

  /**
   * GET /saved-workouts/:workoutId/:userId
   * Returns the full details of one workout.
   */
  @Get(':workoutId/:userId')
  async get(@Param('workoutId') workoutId: string, @Param('userId') userId: string) {
    const data = await this.svc.getWorkout(userId, workoutId);
    return { success: true, data };
  }
}
