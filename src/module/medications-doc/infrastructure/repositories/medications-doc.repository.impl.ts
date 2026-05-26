// src/modules/medications-doc/infrastructure/repositories/medications-doc.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IMedicationsDocRepository } from 'src/module/medications-doc/domain/medications-doc.repository.interface';
import { MedicationsDoc } from '../../domain/medications-doc.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

@Injectable()
export class MedicationsDocRepositoryImpl implements IMedicationsDocRepository {
  constructor(
    @InjectRepository(MedicationsDoc)
    private readonly repository: Repository<MedicationsDoc>,
  ) {}

  async create(doc: MedicationsDoc): Promise<MedicationsDoc> {
    return await this.repository.save(doc);
  }

  async findById(id: string): Promise<MedicationsDoc | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['medication'], // 👈 ajusta según tus relaciones reales
    });
  }

  /** ✅ listado simple sin paginación */
  async findAll(): Promise<MedicationsDoc[]> {
    return await this.repository.find({
      relations: ['medication'],
      order: { id: 'ASC' }, // 🔹 usamos id para el orden
    });
  }

  /** ✅ listado con paginación */
  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<MedicationsDoc>> {
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['medication'],
      order: { id: 'ASC' }, // 🔹 consistente con findAll
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

  async update(id: string, doc: Partial<MedicationsDoc>): Promise<MedicationsDoc> {
    await this.repository.update(id, doc);
    return (await this.findById(id)) as MedicationsDoc;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
