// src/modules/medications/presentation/dtos/update-medications-with-file.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateMedicationWithFileDto {
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const trimmed = typeof value === 'string' ? value.trim() : value;
    return trimmed === '' ? undefined : trimmed;
  })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombre?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const trimmed = typeof value === 'string' ? value.trim() : value;
    return trimmed === '' ? undefined : trimmed;
  })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dosis?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const trimmed = typeof value === 'string' ? value.trim() : value;
    return trimmed === '' ? undefined : trimmed;
  })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = typeof value === 'string' ? Number(value) : value;
    return isNaN(num) ? undefined : num;
  })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  frecuencia_horas?: number;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = typeof value === 'string' ? Number(value) : value;
    return isNaN(num) ? undefined : num;
  })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  cantidad?: number;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = typeof value === 'string' ? Number(value) : value;
    return isNaN(num) ? undefined : num;
  })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duracion_dias?: number;

  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const trimmed = typeof value === 'string' ? value.trim() : value;
    return trimmed === '' ? undefined : trimmed;
  })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  via_administracion?: string;

  @ApiProperty({
    description:
      'IDs de MedicationsDoc que se mantienen. Si se envía vacío, se eliminan todos.',
    required: false,
    type: [String],
    example: ['DOC-123456'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;

    if (typeof value === 'string' && value.trim() === '') return [];

    if (Array.isArray(value)) return value;

    if (typeof value === 'string' && value.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
    }

    return [];
  })
  keep_doc_ids?: string[];

  @ApiProperty({
    description: 'Archivos nuevos a agregar',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  files?: any[];
}
