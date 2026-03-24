import { Controller, Post, Get, Param, Put, Delete, Body, NotFoundException } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';

@Controller('workouts')
export class WorkoutsController {
  constructor(private svc: WorkoutsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Get('user/:uid')
  async list(@Param('uid') uid: string) {
    return this.svc.findByUser(uid);
  }

  @Get(':id/details')
  async getDetails(@Param('id') id: string) {
    const data = await this.svc.findWorkoutScreenById(id);
    if (!data) {
      throw new NotFoundException({ success: false, message: 'Workout not found' });
    }
    return { success: true, data };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
