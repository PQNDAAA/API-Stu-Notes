import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../user/user.interface';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(private db: DbService) {}

  async create(user: User) {
    if (await this.checkIfUserExists(user.email)) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await this.db.query(
      `INSERT INTO users(email, username, password, dateOfBirthday, created_at)
     VALUES($1, $2, $3, $4, NOW())
     RETURNING *`,
      [user.email, user.username, hashedPassword, user.dateOfBirthday],
    );
    return result.rows[0];
  }

  async getUsers() {
    const result = await this.db.query('SELECT * FROM users');
    return result.rows;
  }

  async checkIfUserExists(email: string) {
    const result = await this.db.query('SELECT 1 FROM users WHERE email = $1', [
      email,
    ]);
    return result.rows.length > 0;
  }

  async checkIfSubjectExists(subject: string, user_id: number) {
    const result = await this.db.query(
      'SELECT 1 FROM subjects WHERE user_id = $1 AND name = $2',
      [user_id, subject],
    );
    return result.rows.length > 0;
  }

  async getNameById(id: number) {
    const result = await this.db.query(
      'SELECT username FROM users WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException('No accounts found');
    }
    return result.rows[0];
  }

  async createSubject(id: number, name: string) {
    if (await this.checkIfSubjectExists(name, id)) {
      throw new BadRequestException('Subject already exists');
    }
    const result = await this.db.query(
      `INSERT INTO subjects(user_id, name)
VALUES($1, $2)
RETURNING *`,
      [id, name],
    );
    return result.rows[0];
  }

  async getSubjectsById(id: number) {
    const result = await this.db.query(
      'SELECT name FROM subjects WHERE user_id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException('No accounts found');
    }
    return result.rows;
  }

  getUsersByEmail(value: string) {
    if (!value) return null;

    return this.users.filter((u) => u.email.toLowerCase === value.toLowerCase);
  }
}
