import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { FirebaseService } from '../../services/firebase.service';

@Controller('fitness-tracking')
@UseGuards(FirebaseAuthGuard)
export class FitnessTrackingController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('steps')
  async updateSteps(
    @Request() req,
    @Body() body: { steps: number; date: string }
  ) {
    const userId = req.user.uid;
    await this.firebaseService.updateUserSteps(userId, body.steps, body.date);
    return { message: 'Steps updated successfully', steps: body.steps };
  }

  @Get('steps/:date')
  async getSteps(@Request() req, @Param('date') date: string) {
    const userId = req.user.uid;
    const steps = await this.firebaseService.getUserSteps(userId, date);
    return { date, steps };
  }

  @Post('heart-rate')
  async updateHeartRate(
    @Request() req,
    @Body() body: { heartRate: number }
  ) {
    const userId = req.user.uid;
    await this.firebaseService.updateHeartRate(userId, body.heartRate);
    return { message: 'Heart rate updated successfully' };
  }

  @Get('heart-rate/recent')
  async getRecentHeartRate(@Request() req) {
    const userId = req.user.uid;
    const readings = await this.firebaseService.getRecentHeartRate(userId);
    return { heartRateData: readings };
  }

  @Post('live-workout')
  async updateLiveWorkout(
    @Request() req,
    @Body() body: {
      workoutId: string;
      currentExercise: string;
      duration: number;
      caloriesBurned: number;
      heartRate?: number;
    }
  ) {
    const userId = req.user.uid;
    await this.firebaseService.updateLiveWorkout(userId, body);
    return { message: 'Live workout updated successfully' };
  }

  @Get('live-workout')
  async getLiveWorkout(@Request() req) {
    const userId = req.user.uid;
    const workoutData = await this.firebaseService.getLiveWorkout(userId);
    return { liveWorkout: workoutData };
  }

  @Post('share-workout')
  async shareWorkout(
    @Request() req,
    @Body() body: {
      workoutId: string;
      progress: {
        exercisesCompleted: number;
        totalExercises: number;
        duration: number;
        caloriesBurned: number;
      }
    }
  ) {
    const userId = req.user.uid;
    await this.firebaseService.shareWorkoutProgress(userId, body.workoutId, body.progress);
    return { message: 'Workout progress shared successfully' };
  }

  @Get('shared-workouts')
  async getSharedWorkouts(
    @Request() req,
    @Body() body: { friendsList: string[] }
  ) {
    const sharedWorkouts = await this.firebaseService.getSharedWorkouts(body.friendsList || []);
    return { sharedWorkouts };
  }

  @Post('notifications')
  async sendNotification(
    @Request() req,
    @Body() body: {
      title: string;
      message: string;
      data?: any;
    }
  ) {
    const userId = req.user.uid;
    await this.firebaseService.sendNotification(userId, body.title, body.message, body.data);
    return { message: 'Notification sent successfully' };
  }

  @Get('notifications')
  async getUnreadNotifications(@Request() req) {
    const userId = req.user.uid;
    const notifications = await this.firebaseService.getUnreadNotifications(userId);
    return { notifications };
  }

  @Put('notifications/:notificationId/read')
  async markNotificationAsRead(
    @Request() req,
    @Param('notificationId') notificationId: string
  ) {
    const userId = req.user.uid;
    await this.firebaseService.markNotificationAsRead(userId, notificationId);
    return { message: 'Notification marked as read' };
  }
}