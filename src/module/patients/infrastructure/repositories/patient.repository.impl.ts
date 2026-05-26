// src/module/patients/infrastructure/repositories/patient.repository.impl.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from '../../domain/patient.entity';
import { IPatientRepository } from '../../domain/patient.repository.interface';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

@Injectable()
export class PatientRepositoryImpl implements IPatientRepository {
  constructor(
    @InjectRepository(Patient)
    private readonly repo: Repository<Patient>,
  ) {}

  async save(entity: Patient): Promise<Patient> {
    return await this.repo.save(entity);
  }

  /** ✅ listado simple sin paginación (incluye profile) */
  async findAll(): Promise<Patient[]> {
    return await this.repo.find({
      relations: ['profile'],
      withDeleted: false,
    });
  }

  /** ✅ listado con paginación (incluye profile) */
  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Patient>> {
    const [data, total] = await this.repo.findAndCount({
      relations: ['profile'],
      withDeleted: false,
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

  async findOne(user_id: string): Promise<Patient | null> {
    return await this.repo.findOne({
      where: { user_id },
      relations: ['profile'],
      withDeleted: false,
    });
  }

  async update(user_id: string, partial: Partial<Patient>): Promise<Patient> {
    const existing = await this.repo.findOne({ where: { user_id } });
    if (!existing) throw new NotFoundException('Patient not found');
    Object.assign(existing, partial);
    return await this.repo.save(existing);
  }

  async softDelete(user_id: string): Promise<void> {
    const res = await this.repo.softDelete({ user_id });
    if (!res.affected) throw new NotFoundException('Patient not found');
  }
}
