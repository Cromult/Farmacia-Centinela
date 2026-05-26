// src/modules/profiles/presentation/dtos/update-profile.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ApiExtraModels } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

@ApiExtraModels(CreateProfileDto)
export class UpdateProfileDto extends PartialType(
  OmitType(CreateProfileDto, ['user_id'] as const),
) {}
