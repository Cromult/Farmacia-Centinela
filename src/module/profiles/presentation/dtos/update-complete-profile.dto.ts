// src/modules/profiles/presentation/dtos/update-complete-profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateStudentDataDto {
  @ApiPropertyOptional({ example: 'Colegio San Calixto' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  previousSchool?: string;

  @ApiPropertyOptional({ example: '2023-12-15' })
  @IsOptional()
  @IsDateString()
  degreeIssueDate?: string;

  @ApiPropertyOptional({ example: '2024-01-10' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;
}

class UpdateProfessorDataDto {
  @ApiPropertyOptional({ example: '+591 78945612' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Ingeniero de Sistemas' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;

  @ApiPropertyOptional({ example: 'Inteligencia Artificial' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fieldOfExpertise?: string;

  @ApiPropertyOptional({ example: 'Doctorado' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  academicDegree?: string;

  @ApiPropertyOptional({ example: 'Maestría en Machine Learning' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  otherDegrees?: string;
}

export class UpdateCompleteProfileDto {
  // ===== USER DATA =====
  @ApiPropertyOptional({ example: 'juan.perez@uvirtual.local' })
  @IsOptional()
  @IsEmail()
  email?: string;

  // ===== PROFILE DATA =====
  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'Pérez González' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastname!: string;

  @ApiPropertyOptional({ example: '1995-05-15' })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiPropertyOptional({ example: 'La Paz, Bolivia' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  birthplace?: string;

  @ApiPropertyOptional({ example: 'Boliviana' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nationality?: string;

  @ApiPropertyOptional({ example: 'Masculino' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  // ===== SPECIFIC DATA =====
  @ApiPropertyOptional({ type: UpdateStudentDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStudentDataDto)
  student?: UpdateStudentDataDto;

  @ApiPropertyOptional({ type: UpdateProfessorDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfessorDataDto)
  professor?: UpdateProfessorDataDto;
}
