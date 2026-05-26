// src/modules/profiles/profiles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from './domain/profile.entity';
import { ProfilesController } from './presentation/profile.controller';
import { ProfilesService } from './application/profile.service';

import { PROFILE_REPOSITORY } from './domain/profile.repository.interface';
import { ProfileRepositoryImpl } from './infrastructure/repositories/profile.repository.impl';

import { User } from '../users/domain/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User])],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },
  ],
  exports: [
    ProfilesService,
    PROFILE_REPOSITORY,
  ],
})
export class ProfilesModule {}
