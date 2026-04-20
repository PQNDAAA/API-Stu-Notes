import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService implements OnModuleInit {
  private pool: Pool;

  onModuleInit() {
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'admin',
      password: '089!3503Ro!!*',
      database: 'stunotes',
    });
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
