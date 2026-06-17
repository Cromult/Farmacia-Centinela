// src/modules/medicantion-notification/infrastructure/repositories/medicantion-notification.repository.impl.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IMedicantionNotificationRepository } from '../../domain/medicantion-notification.repository.interface';
import { MedicantionNotification } from '../../domain/medicantion-notification.entity';

@Injectable()
export class MedicantionNotificationRepositoryImpl implements IMedicantionNotificationRepository {
  constructor(
    @InjectRepository(MedicantionNotification)
    private readonly repository: Repository<MedicantionNotification>,
  ) {}

  // -------------------------
  // CRUD base
  // -------------------------

  async create(
    notification: MedicantionNotification,
  ): Promise<MedicantionNotification> {
    return this.repository.save(notification);
  }

  async findAll(): Promise<MedicantionNotification[]> {
    return this.repository.find({
      relations: ['medication'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<MedicantionNotification | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['medication'],
    });
  }

  async update(
    id: string,
    payload: Partial<MedicantionNotification>,
  ): Promise<MedicantionNotification> {
    await this.repository.update(id, payload);
    return (await this.findById(id)) as MedicantionNotification;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  // -------------------------
  // Búsqueda por relación
  // -------------------------

  async findByMedicationId(
    medicationId: string,
  ): Promise<MedicantionNotification[]> {
    return this.repository.find({
      where: { medication_id: medicationId },
      relations: ['medication'],
      order: { created_at: 'DESC' },
    });
  }

  async findFilteredByMedications(
    medicationIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<MedicantionNotification[]> {
    if (!medicationIds || medicationIds.length === 0) return [];

    return (
      this.repository
        .createQueryBuilder('notification')
        // Traemos los datos de la medicina para armar la respuesta después
        .leftJoinAndSelect('notification.medication', 'medication')
        .where('notification.medication_id IN (:...medicationIds)', {
          medicationIds,
        })
        .andWhere('notification.created_at >= :startDate', { startDate })
        .andWhere('notification.created_at <= :endDate', { endDate })
        // Ordenamos para que lo más reciente salga primero
        .orderBy('notification.created_at', 'DESC')
        .getMany()
    );
  }
}
