// src/module/medicantion-notification/presentation/dtos/get-medicantion-notification.dto.ts

import { MedicantionNotification } from '../../domain/medicantion-notification.entity';

export class GetMedicantionNotificationDto {
  id!: string;
  medication_id!: string;
  tiempo_tomado?: Date | null;
  estado!: string;
  frecuencias_horas!: number;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  static fromEntity(
    entity: MedicantionNotification,
  ): GetMedicantionNotificationDto {
    const dto = new GetMedicantionNotificationDto();

    dto.id = entity.id;
    dto.medication_id = entity.medication_id;
    dto.tiempo_tomado = entity.tiempo_tomado ?? null;
    dto.estado = entity.estado;
    dto.frecuencias_horas = entity.frecuencias_horas;

    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    dto.deleted_at = entity.deleted_at ?? null;

    return dto;
  }
}