// src/modules/prescriptions/infrastructure/repositories/prescriptions.repository.impl.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPrescriptionRepository } from '../../domain/prescriptions.repository.interface';
import { Prescription } from '../../domain/prescriptions.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

@Injectable()
export class PrescriptionRepositoryImpl implements IPrescriptionRepository {
  constructor(
    @InjectRepository(Prescription)
    private readonly repository: Repository<Prescription>,
  ) {}

  async create(prescription: Prescription): Promise<Prescription> {
    return await this.repository.save(prescription);
  }

  async findById(id: string): Promise<Prescription | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['patient'], // 👈 importante para traer la relación
    });
  }

  async findAll(): Promise<Prescription[]> {
    return this.repository.find({
      relations: ['patient'], // 👈 opcional pero recomendado
    });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Prescription>> {
    const [data, total] = await this.repository.findAndCount({
      relations: ['patient'],
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

  async update(
    id: string,
    prescription: Partial<Prescription>,
  ): Promise<Prescription> {
    await this.repository.update(id, prescription);
    return (await this.findById(id)) as Prescription;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  // metodo dashboard
  async getDashboardByUserId(userId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const qb = this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.patient', 'patient')
      .leftJoinAndSelect('patient.profile', 'profile')
      .leftJoinAndSelect('p.medications', 'medication')
      .leftJoinAndSelect('medication.medications_docs', 'docs')
      // NUEVO: Traemos el historial de tomas
      .leftJoinAndSelect('medication.notifications', 'notification')
      .where('patient.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL')
      // Ordenamos para que la receta más nueva esté primero
      .orderBy('p.created_at', 'DESC')
      // IMPORTANTE: Ordenamos notificaciones de la más reciente a la más antigua
      .addOrderBy('notification.created_at', 'DESC');

    const active = await qb
      .clone()
      .andWhere(
        '(p.fecha_inicio_receta <= :today AND p.fecha_fin_receta >= :today)',
        { today },
      )
      .getOne();

    if (active) return active;

    return qb.clone().getOne();
  }
  async getPatientByUserId(userId: string): Promise<any> {
    return this.repository.manager
      .createQueryBuilder()
      .select('patient')
      .from('patients', 'patient')
      .leftJoinAndSelect('patient.profile', 'profile')
      .where('patient.user_id = :userId', { userId })
      .getOne();
  }
  async findAllByUserId(userId: string): Promise<Prescription[]> {
    return this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.patient', 'patient')
      .where('patient.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL')
      .orderBy('p.created_at', 'DESC')
      .getMany();
  }

  async getPrescriptionWithHistory(prescriptionId: string): Promise<any> {
    return (
      this.repository
        .createQueryBuilder('p')
        // 1. Traemos los medicamentos de la receta
        .leftJoinAndSelect('p.medications', 'medication')
        // 2. Traemos el historial (notificaciones) de cada medicamento
        .leftJoinAndSelect('medication.notifications', 'notification')
        .where('p.id = :prescriptionId', { prescriptionId })
        .andWhere('p.deleted_at IS NULL')
        .andWhere('medication.deleted_at IS NULL')
        // 3. Ordenamos las notificaciones: Las más recientes primero
        .orderBy('notification.created_at', 'DESC')
        .getOne()
    );
  }
}
