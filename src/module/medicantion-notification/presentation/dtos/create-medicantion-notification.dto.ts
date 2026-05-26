// src/module/medicantion-notification/presentation/dtos/create-medicantion-notification.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, IsDateString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MedicationNotificationStatus } from '../../domain/medicantion-notification.entity';

export class CreateMedicantionNotificationDto {
  @ApiProperty({
    description: 'ID del medication',
    minLength: 1,
    maxLength: 27,
  })
  @IsString()
  @Length(1, 27)
  medication_id!: string;

  @ApiProperty({
    description: 'Fecha y hora en que se tomó el medicamento',
    required: false,
    example: '2026-04-11T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  tiempo_tomado?: string;

  @ApiProperty({
    description: 'Estado de la toma del medicamento',
    enum: MedicationNotificationStatus,
    default: MedicationNotificationStatus.NO_TOMADO,
  })
  @IsEnum(MedicationNotificationStatus)
  estado!: MedicationNotificationStatus;

  @ApiProperty({
    description: 'Frecuencia en horas',
    example: 8,
  })
  @Type(() => Number) // IMPORTANTE: multipart transforma todo a string, esto lo vuelve a número
  @IsInt()
  frecuencias_horas!: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Foto en caliente de la pastilla que el paciente está a punto de tomar',
    required: true,
  })
  file!: any; // Usado solo para documentar Swagger
}