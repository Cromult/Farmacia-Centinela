import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../domain/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds = 10;
  async hash(plain: string): Promise<string> { return await bcrypt.hash(plain, this.rounds); }
  async compare(plain: string, hashed: string): Promise<boolean> { return await bcrypt.compare(plain, hashed); }
}
