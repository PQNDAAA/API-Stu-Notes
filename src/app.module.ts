import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbService } from './db/db.service';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DbService],
})
export class AppModule {}
