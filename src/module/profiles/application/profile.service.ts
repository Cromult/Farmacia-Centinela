// src/modules/profiles/application/profiles.service.ts
import { DataSource } from 'typeorm';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';
import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { Profile } from '../domain/profile.entity';
import * as profileRepositoryInterface from '../domain/profile.repository.interface';
import { CreateProfileDto } from '../presentation/dtos/create-profile.dto';
import { UpdateProfileDto } from '../presentation/dtos/update-profile.dto';
import { UpdateCompleteProfileDto } from '../presentation/dtos/update-complete-profile.dto';
import { CompleteProfileResponseDto } from '../presentation/dtos/complete-profile-response.dto';
import { ProfileType } from '../presentation/dtos/update-complete-profile-query.dto';
import { User } from 'src/module/users/domain/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @Inject(profileRepositoryInterface.PROFILE_REPOSITORY)
    private readonly repository: profileRepositoryInterface.IProfileRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProfileDto): Promise<Profile> {
    const entity = this.dataSource.getRepository(Profile).create({
      user_id: dto.user_id,
      name: dto.name,
      lastname: dto.lastname,
      birthdate: dto.birthdate, // ISO string aceptada; TypeORM lo guarda como DATE
      birthplace: dto.birthplace,
      nationality: dto.nationality,
      ci: dto.ci,
      gender: dto.gender,
    });
    return await this.repository.save(entity);
  }

  /** listado simple (sin paginación) */
  async findAll(): Promise<Profile[]> {
    return await this.repository.findAll();
  }

  /** listado paginado */
  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Profile>> {
    return await this.repository.findAllPaginated(page, limit);
  }

  async findOne(user_id: string): Promise<Profile> {
    const p = await this.repository.findOne(user_id);
    if (!p) throw new NotFoundException('Profile not found');
    return p;
  }

  async update(user_id: string, dto: UpdateProfileDto): Promise<Profile> {
    return await this.repository.update(user_id, dto);
  }

  async remove(user_id: string): Promise<void> {
    await this.repository.softDelete(user_id);
  }
}
