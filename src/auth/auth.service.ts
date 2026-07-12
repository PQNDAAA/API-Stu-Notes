import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import appleSignin from 'apple-signin-auth';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(
    private db: DbService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    const user = result.rows[0];
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = await this.jwtService.signAsync({
      userId: user.id,
      userEmail: user.email,
    });

    console.log('Hello');

    return { accessToken: token };
  }

  async verifyAppleToken(identifyToken: string) {
    const payload = await appleSignin.verifyIdToken(identifyToken, {
      audience: 'fr.dgsd.stunotes',
    });
    return payload;
  }

  async verifyGoogleToken(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  }
}
