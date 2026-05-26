// src/modules/prescriptions/presentation/dtos/create-prescriptions.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'ID del paciente al que pertenece la receta',
    example: 'PAT-1693345600000-A1B2C3',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  @Matches(/^PAT-\d{13}-[A-F0-9]{6}$/, {
    message: 'El ID del paciente no tiene el formato correcto',
  })
  patient_id!: string;

  @ApiProperty({
    description: 'Instrucciones globales de la receta',
    example: 'Tomar 1 pastilla cada 8 horas después de las comidas',
  })
  @IsString()
  @IsNotEmpty({ message: 'Las instrucciones son obligatorias' })
  @Transform(({ value }) => value.trim())
  instrucciones_globales!: string;

  @ApiProperty({
    description: 'Fecha de inicio de la receta',
    example: '2026-03-24',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fecha_inicio_receta!: Date;

  @ApiProperty({
    description: 'Fecha de fin de la receta',
    example: '2026-04-01',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fecha_fin_receta!: Date;
}
