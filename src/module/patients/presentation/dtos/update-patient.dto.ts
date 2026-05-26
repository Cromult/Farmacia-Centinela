// src/module/patients/presentation/dtos/update-patient.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['user_id'] as const),
) {}
