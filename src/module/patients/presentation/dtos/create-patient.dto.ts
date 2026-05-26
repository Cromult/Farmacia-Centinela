// src/module/patients/presentation/dtos/create-patient.dto.ts
import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({
    description: 'User ID (PK=FK a profiles.user_id)',
    minLength: 1,
    maxLength: 27,
  })
  @IsString()
  @Length(1, 27)
  user_id!: string;

  @ApiProperty({
    description: 'Hospital de procedencia',
    required: false,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  hospital?: string;
}
