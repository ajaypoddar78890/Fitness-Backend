import { Controller, Get, Param, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Authenticated user's profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    // Jwt strategy returns a payload that includes the custom `uid` field
    const uid = req.user?.uid || req.user?.sub || req.user?.id;
    return this.usersService.findByUid(uid);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateProfile(id, body);
  }
}
