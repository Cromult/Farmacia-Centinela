// src/module/patients/presentation/dtos/get-patient.dto.ts
import { Patient } from '../../domain/patient.entity';

export class GetPatientDto {
  user_id!: string;
  hospital?: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  static fromEntity(entity: Patient): GetPatientDto {
    const dto = new GetPatientDto();
    dto.user_id = entity.user_id;
    dto.hospital = entity.hospital;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    dto.deleted_at = entity.deleted_at ?? null;
    return dto;
  }
}
