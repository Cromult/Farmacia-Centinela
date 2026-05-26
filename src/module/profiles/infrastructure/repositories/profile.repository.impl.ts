// src/modules/profiles/infrastructure/repositories/profile.repository.impl.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../../domain/profile.entity';
import { IProfileRepository } from '../../domain/profile.repository.interface';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

@Injectable()
export class ProfileRepositoryImpl implements IProfileRepository {
  constructor(
    @InjectRepository(Profile)
    private readonly repo: Repository<Profile>,
  ) {}

  async save(entity: Profile): Promise<Profile> {
    return await this.repo.save(entity);
  }

  async findAll(): Promise<Profile[]> {
    return await this.repo.find({
      relations: ['user', 'patient', 'profile_picture'],
      withDeleted: false,
      order: { lastname: 'ASC', name: 'ASC' },
    });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Profile>> {
    const [data, total] = await this.repo.findAndCount({
      relations: ['user', 'patient', 'profile_picture'],
      withDeleted: false,
      order: { lastname: 'ASC', name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(user_id: string): Promise<Profile | null> {
    return await this.repo.findOne({
      where: { user_id },
      relations: ['user', 'patient', 'profile_picture'],
      withDeleted: false,
    });
  }

  async update(user_id: string, partial: Partial<Profile>): Promise<Profile> {
    const existing = await this.repo.findOne({ where: { user_id } });
    if (!existing) throw new NotFoundException('Profile not found');
    Object.assign(existing, partial);
    return await this.repo.save(existing);
  }

  async softDelete(user_id: string): Promise<void> {
    const res = await this.repo.softDelete({ user_id });
    if (!res.affected) throw new NotFoundException('Profile not found');
  }

  async findOneWithDetails(user_id: string): Promise<Profile | null> {
    return await this.repo.findOne({
      where: { user_id },
      relations: ['user', 'patient', 'profile_picture'],
      withDeleted: false,
    });
  }
  async updateProfilePicture(
    userId: string,
    mediaId: string | null,
  ): Promise<Profile> {
    await this.repo.update(
      { user_id: userId },
      { profile_picture_media_id: mediaId },
    );
    const updated = await this.findOne(userId);
    if (!updated) throw new Error('Profile not found after update');
    return updated;
  }
}
