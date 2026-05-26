// src/module/patients/presentation/dtos/create-patient-user-profile.dto.ts

import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { CreateUserDto } from 'src/module/users/presentation/dtos/create-user.dto';
import { CreateProfileDto } from 'src/module/profiles/presentation/dtos/create-profile.dto';
import { CreatePatientDto } from './create-patient.dto';

export class CreatePatientUserProfileDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user!: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile!: CreateProfileDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePatientDto)
  patient?: CreatePatientDto;
}