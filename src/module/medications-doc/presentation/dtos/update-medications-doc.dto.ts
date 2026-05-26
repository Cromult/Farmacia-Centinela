// src/modules/medications-docs/presentation/dtos/update-medications-doc.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMedicationsDocDto {
  @ApiPropertyOptional({
    description: 'Reasignar un media ya subido (1–1). Enviar null para desasociar.',
    example: 'MEDIA-1693043205123-ABC123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  media_id?: string; // | null
}
