// src/modules/medications/presentation/dtos/update-medications-image.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMedicationImageDto {
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

    return undefined;
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
