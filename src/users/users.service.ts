import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../user/user.interface';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private db: DbService) {}

  async create(user: User) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await this.db.query(
      `INSERT INTO users(email, username, password, dateOfBirthday, created_at, apple_user_id, google_user_id)
     VALUES($1, $2, $3, $4, NOW(), $5,$6)
     RETURNING *`,
      [
        user.email,
        user.username,
        hashedPassword,
        user.dateOfBirthday,
        user?.apple_user_id,
        user?.google_user_id,
      ],
    );
    return result.rows[0];
  }

  async getUsers() {
    const result = await this.db.query('SELECT * FROM users');
    return result.rows;
  }

  async modifyUsername(id: number, username: string) {
    const result = await this.db.query(
      'UPDATE users SET username = $1 WHERE id = $2',
      [username, id],
    );
    return result.rows[0];
  }

  async modifyUser(id: number, targetKey: string, newValue: string) {
    const result = await this.db.query(
      `UPDATE users SET ${targetKey} = $1 WHERE id = $2 RETURNING *`,
      [newValue, id],
    );
    return result.rows[0];
  }

  async checkIfUserExists(username: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username],
    );
    return result.rows.length > 0;
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
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

  async getUserById(id: number) {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [
      id,
    ]);
    return { user: result.rows[0], isExisting: result.rows.length > 0 };
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

  async findAppleId(sub: string) {
    const result = await this.db.query(
      'SELECT * FROM users where apple_user_id = $1',
      [sub],
    );

    return result.rows[0];
  }

  async findGoogleId(sub: string) {
    const result = await this.db.query(
      'SELECT * FROM users where google_user_id = $1',
      [sub],
    );

    return result.rows[0];
  }

  async updatePhotoUrl(path: string, id: number) {
    const result = await this.db.query(
      'UPDATE users SET photo_url = $1 WHERE id = $2',
      [path, id],
    );
    return result.rows[0];
  }

  async deletePhotoUrl(id: number) {
    const result = await this.db.query(
      'UPDATE users SET photo_url = NULL WHERE id = $1',
      [id],
    );
    return result.rows[0];
  }
}
