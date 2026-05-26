// src/modules/medications/presentation/dtos/create-medications-with-file.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
export class CreateMedicationWithFileDto {
  @ApiProperty({
    description: 'ID de la prescription asociada',
    example: 'PRES-0001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  prescription_id!: string;

  @ApiProperty({
    description: 'Nombre del medicamento',
    example: 'Paracetamol',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombre!: string;

  @ApiProperty({
    description: 'Dosis del medicamento',
    example: '500mg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  dosis!: string;

  @ApiProperty({
    description: 'Instrucciones específicas del medicamento',
    example: 'Tomar después de las comidas',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  descripcion!: string;

  @ApiProperty({
    description: 'Frecuencia en horas',
    example: 8,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  frecuencia_horas!: number;

  @ApiProperty({
    description: 'Cantidad total de pastillas/cápsulas',
    example: 30,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  cantidad!: number;

  @ApiProperty({
    description: 'Duración del tratamiento en días',
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duracion_dias!: number;

  @ApiProperty({
    description: 'Vía de administración',
    example: 'Oral',
    default: 'Oral',
  })
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  via_administracion?: string;

  @ApiProperty({
    description: 'Archivos del medicamento (recetas, imágenes, etc.)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files!: any[];
}
