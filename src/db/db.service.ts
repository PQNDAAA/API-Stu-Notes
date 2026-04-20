import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService implements OnModuleInit {
  private pool: Pool;

  onModuleInit() {
    this.pool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      user: 'admin',
      password: 'Dg061103',
      database: 'stunotes',
    });
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
