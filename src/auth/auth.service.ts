import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

      constructor(private db: DbService, private jwtService: JwtService) {}

    
  async login(email: string, password: string){
    const result =  await this.db.query('SELECT * FROM users WHERE email = $1',
    [email]);

    const user = result.rows[0];
    if(!user){
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      throw new UnauthorizedException('Invalid password');
    }

    const token = await this.jwtService.signAsync({
      userId: user.id,
      userEmail: user.email
    });

    return {accessToken: token};
  }
}
