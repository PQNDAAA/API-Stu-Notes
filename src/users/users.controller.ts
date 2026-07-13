import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { unlink } from 'node:fs/promises';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserById(@Req() req) {
    return this.users.getUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async modifyProfile(
    @Req() req,
    @Body() body: { targetKey: string; newValue: string },
  ) {
    return this.users.modifyUser(
      req.user.userId,
      body.targetKey,
      body.newValue,
    );
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
  @Patch('username/edit')
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

  @UseGuards(JwtAuthGuard)
  @Patch('me/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: 'src/uploads/avatars',
        filename: (req, file, callback) => {
          const user = req.user as { userId: number; userEmail: string };

          const uniqueName = `${user.userId}-${Date.now()}${extname(file.originalname)}`;
          console.log('Nom du fichier généré:', uniqueName);
          console.log('CWD actuel:', process.cwd());
          callback(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, //5MB MAX
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException('Format non approprié'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updatePhoto(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const currentUser = await this.users.getUserById(req.user.userId);

    if (currentUser.user.photo_url) {
      const old_path = process.cwd() + '/' + currentUser.user.photo_url;
      try {
        await unlink(old_path);
      } catch (e) {
        throw new Error('Unable to delete old path.', e);
      }
    }

    const photoUrl = `src/uploads/avatars/${file.filename}`;
    await this.users.updatePhotoUrl(photoUrl, req.user.userId);

    return { photoUrl };
  }
  @UseGuards(JwtAuthGuard)
  @Get('me/photo')
  async getMyPhoto(@Req() req, @Res() res) {
    const currentUser = await this.users.getUserById(req.user.userId);

    if (!currentUser.user.photo_url) {
      throw new NotFoundException('No photo URL');
    }

    const filepath = join(process.cwd(), currentUser.user.photo_url);

    console.log(filepath);
    return res.sendFile(filepath);
  }
}
