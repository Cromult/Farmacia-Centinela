// src/modules/prescriptions/presentation/dtos/process-raw-prescription.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ProcessRawPrescriptionDto {
  @ApiProperty({
    description: 'Texto libre de la receta médica',
    example: 'Tomar Paracetamol 500mg cada 8 horas...',
  })
  @IsString()
  @IsNotEmpty()
  texto_receta!: string;

  // Este campo se inyecta automáticamente en el controller desde el JWT
  patient_id?: string;
}
