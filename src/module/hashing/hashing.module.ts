import { Module } from '@nestjs/common';
import { PASSWORD_HASHER } from './domain/password-hasher.interface';
import { BcryptPasswordHasher } from './application/bcrypt-password-hasher.service';

@Module({
  providers: [{ provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher }],
  exports: [{ provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher }],
})
export class HashingModule {}
