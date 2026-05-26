// src/modules/media/presentation/dto/get-presigned-url.dto.ts
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPresignedUrlDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60) // mínimo 1 minuto
  @Max(86400) // máximo 24h
  exp?: number;
}
