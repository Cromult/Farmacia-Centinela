// src/modules/prescriptions/presentation/dtos/update-prescriptions.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePrescriptionDto {
  @ApiProperty({
    description: 'Instrucciones globales de la receta',
    required: false,
    example: 'Tomar 1 pastilla cada 12 horas',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  instrucciones_globales?: string;

  @ApiProperty({
    description: 'Fecha de inicio de la receta',
    required: false,
    example: '2026-03-25',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  fecha_inicio_receta?: Date;

  @ApiProperty({
    description: 'Fecha de fin de la receta',
    required: false,
    example: '2026-04-05',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser válida' })
  fecha_fin_receta?: Date;
}