import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import * as userInterface from '../user/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

@UseGuards(JwtAuthGuard)
  @Get('name')
   getUserById(@Req() req){
    return this.users.getNameById(req.user.userId);
  }

  @Post()
  create(
    @Body() body: userInterface.User) {
    return this.users.create(body);
  }

  @Get()
  getUsers() {
    return this.users.getUsers();
  }
}
