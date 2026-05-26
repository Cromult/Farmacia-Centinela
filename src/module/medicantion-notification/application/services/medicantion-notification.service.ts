// src/modules/medicantion-notification/application/services/medicantion-notification.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';

import type { IMedicantionNotificationRepository } from '../../domain/medicantion-notification.repository.interface';
import { MedicantionNotification } from '../../domain/medicantion-notification.entity';

@Injectable()
export class MedicantionNotificationService {
  constructor(
    @Inject('IMedicantionNotificationRepository')
    private readonly notificationRepo: IMedicantionNotificationRepository,
  ) {}

  // -------------------------
  // CREATE
  // -------------------------
  async create(params: {
    medication_id: string;
    tiempo_tomado?: string;
    estado: string;
    frecuencias_horas: number;
  }): Promise<MedicantionNotification> {
    const { medication_id, tiempo_tomado, estado, frecuencias_horas } = params;

    if (!medication_id?.trim()) {
      throw new BadRequestException('medication_id requerido');
    }

    const notification = new MedicantionNotification();
    notification.medication_id = medication_id.trim();
    notification.estado = estado as any;
    notification.frecuencias_horas = frecuencias_horas;

    if (tiempo_tomado) {
      notification.tiempo_tomado = new Date(tiempo_tomado);
    }

    return this.notificationRepo.create(notification);
  }

  // -------------------------
  // FIND ALL
  // -------------------------
  async findAll(): Promise<MedicantionNotification[]> {
    return this.notificationRepo.findAll();
  }

  // -------------------------
  // FIND BY ID
  // -------------------------
  async findById(id: string): Promise<MedicantionNotification> {
    const notification = await this.notificationRepo.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  // -------------------------
  // FIND BY MEDICATION
  // -------------------------
  async findByMedicationId(
    medicationId: string,
  ): Promise<MedicantionNotification[]> {
    if (!medicationId?.trim()) {
      throw new BadRequestException('medicationId requerido');
    }

    return this.notificationRepo.findByMedicationId(medicationId);
  }

  // -------------------------
  // UPDATE
  // -------------------------
  async update(params: {
    id: string;
    tiempo_tomado?: string;
    estado?: string;
    frecuencias_horas?: number;
  }): Promise<MedicantionNotification> {
    const { id, tiempo_tomado, estado, frecuencias_horas } = params;

    const existing = await this.notificationRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    const payload: Partial<MedicantionNotification> = {};

    if (estado !== undefined) {
      payload.estado = estado as any;
    }

    if (frecuencias_horas !== undefined) {
      payload.frecuencias_horas = frecuencias_horas;
    }

    if (tiempo_tomado !== undefined) {
      payload.tiempo_tomado = tiempo_tomado
        ? new Date(tiempo_tomado)
        : undefined;
    }

    return this.notificationRepo.update(id, payload);
  }

  // -------------------------
  // DELETE (SOFT)
  // -------------------------
  async softDelete(id: string): Promise<void> {
    const existing = await this.notificationRepo.findById(id);

    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.softDelete(id);
  }
}
