import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { UserController } from './presentation/controllers/user.controller';
import { UserService } from './application/user.service';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { HashingModule } from '../hashing/hashing.module';
import { USER_REPOSITORY } from './domain/user.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HashingModule],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
  ],
  exports: [USER_REPOSITORY, UserService],
})
export class UsersModule {}
