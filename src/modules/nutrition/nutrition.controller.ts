import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { NutritionService } from './nutrition.service';

@Controller('nutrition')
export class NutritionController {
  constructor(private svc: NutritionService) {}

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Get('user/:uid')
  list(@Param('uid') uid: string) {
    return this.svc.findByUser(uid);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
