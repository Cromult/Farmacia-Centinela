// src/modules/medicantion-notification/domain/medicantion-notification.repository.interface.ts

import { MedicantionNotification } from './medicantion-notification.entity';

export interface IMedicantionNotificationRepository {
  // -------------------------
  // CRUD base
  // -------------------------
  create(
    notification: MedicantionNotification,
  ): Promise<MedicantionNotification>;

  findAll(): Promise<MedicantionNotification[]>;

  findById(id: string): Promise<MedicantionNotification | null>;

  update(
    id: string,
    payload: Partial<MedicantionNotification>,
  ): Promise<MedicantionNotification>;

  softDelete(id: string): Promise<void>;

  // -------------------------
  // Búsqueda por relación
  // -------------------------
  /** Obtener todas las notificaciones de un medication */
  findByMedicationId(medicationId: string): Promise<MedicantionNotification[]>;
}
