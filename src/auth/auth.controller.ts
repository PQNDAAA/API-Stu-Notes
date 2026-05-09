import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Post('apple/signup')
  async appleSignup(
    @Body()
    body: {
      identityToken: string;
      email: string;
      name: string;
    },
  ) {
    const payload = await this.auth.verifyAppleToken(body.identityToken);

    let user = await this.users.findAppleId(payload.sub);

    if (user) {
      const token = await this.generateToken(user);
      return { accessToken: token, isNewUser: false };
    }

    user = await this.users.create({
      email: payload.email,
      username: '',
      password: '',
      dateOfBirthday: '',
      apple_user_id: payload.sub,
    });

    const token = await this.generateToken(user);
    return { accessToken: token, isNewUser: true };
  }

  @Post('google/signup')
  async googleSignup(
    @Body()
    body: {
      idToken: string;
    },
  ) {
    const payload = await this.auth.verifyGoogleToken(body.idToken);
    if (!payload) return;

    let user = await this.users.findGoogleId(payload.sub);

    const email = payload?.email;
    const name = payload?.name;

    if (!user && email && name) {
      user = await this.users.create({
        dateOfBirthday: '',
        email: email,
        google_user_id: payload.sub,
        password: '',
        username: '',
      });
      const token = await this.generateToken(user);
      return { accessToken: token, isNewUser: true };
    } else if (!user && (!email || !user)) {
      throw new Error('Impossible de récupérer les informations Google');
    }

    const token = await this.generateToken(user);
    return { accessToken: token, isNewUser: false };
  }

  async generateToken(user: any) {
    return await this.jwtService.signAsync({
      userId: user.id,
      userEmail: user.email,
    });
  }
}
