// src/modules/profiles/presentation/dtos/create-profile.dto.ts
import { IsOptional, IsString, Length, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({
    description: 'User ID (PK=FK a users.id)',
    example: 'usr_01J7W2W9AH8Z9XK2TE7K2C7GQF',
    minLength: 1,
    maxLength: 26,
  })
  @IsString()
  @Length(1, 26)
  user_id!: string;

  @ApiProperty({ description: 'Nombre', example: 'Antonio', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ description: 'Apellido', example: 'Calderón', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  lastname!: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (YYYY-MM-DD)',
    example: '1998-06-21',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiProperty({
    description: 'Lugar de nacimiento',
    example: 'Sucre, Bolivia',
    required: false,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  birthplace?: string;

  @ApiProperty({
    description: 'Nacionalidad',
    example: 'Boliviana',
    required: false,
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  nationality?: string;

  @ApiProperty({
    description: 'CI (documento de identidad)',
    example: '12345678 SC',
    maxLength: 30,
  })
  @IsString()
  @Length(1, 30)
  ci!: string;

  @ApiProperty({
    description: 'Género',
    example: 'masculino',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  gender?: string;
}