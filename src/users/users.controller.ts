import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as userInterface from '../user/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('username')
  getUserById(@Req() req) {
    return this.users.getUserById(req.user.userId);
  }

  @Get('check-username/:username')
  async checkIfUserExists(@Param('username') username: string) {
    return await this.users.checkIfUserExists(username);
  }

  @Get('check-email/:email')
  async checkIfEmailExists(@Param('email') email: string) {
    return await this.users.checkIfEmailExists(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('username/edit')
  modifyUsername(@Req() req, @Body('username') username: string) {
    return this.users.modifyUsername(req.user.userId, username);
  }
  @UseGuards(JwtAuthGuard)
  @Get('subjects')
  getSubjectsById(@Req() req) {
    return this.users.getSubjectsById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('createSubject')
  createSubject(@Req() req, @Body('name') name: string) {
    return this.users.createSubject(req.user.userId, name);
  }

  @Post()
  create(@Body() body: userInterface.User) {
    return this.users.create(body);
  }
}
