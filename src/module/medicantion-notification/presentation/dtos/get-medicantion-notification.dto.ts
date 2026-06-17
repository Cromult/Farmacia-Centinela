// src/module/medicantion-notification/presentation/dtos/get-medicantion-notification.dto.ts

import { MedicantionNotification } from '../../domain/medicantion-notification.entity';
// Si usas Swagger, puedes agregar @ApiProperty() a los campos

export class GetMedicantionNotificationDto {
  id!: string;
  medication_id!: string;
  
  // 🔥 NUEVOS CAMPOS AÑADIDOS
  medication_nombre!: string;
  medication_descripcion!: string;
  
  tiempo_tomado?: Date | null;
  estado!: string;
  frecuencias_horas!: number;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  static fromEntity(
    entity: any, // Lo dejamos genérico o tipo MedicantionNotification para leer la relación
  ): GetMedicantionNotificationDto {
    const dto = new GetMedicantionNotificationDto();

    dto.id = entity.id;
    dto.medication_id = entity.medication_id;

    // 🔥 EXTRAEMOS LOS DATOS DE LA RELACIÓN (Si existen)
    dto.medication_nombre = entity.medication?.nombre || 'Desconocido';
    dto.medication_descripcion = entity.medication?.descripcion || '';

    dto.tiempo_tomado = entity.tiempo_tomado ?? null;
    dto.estado = entity.estado;
    dto.frecuencias_horas = entity.frecuencias_horas;

    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    dto.deleted_at = entity.deleted_at ?? null;

    return dto;
  }
}