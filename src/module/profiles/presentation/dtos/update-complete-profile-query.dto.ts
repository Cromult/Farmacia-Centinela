// src/modules/profiles/presentation/dtos/update-complete-profile-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ProfileType {
  STUDENT = 'student',
  PROFESSOR = 'professor',
}

export class UpdateCompleteProfileQueryDto {
  @ApiProperty({
    enum: ProfileType,
    example: ProfileType.STUDENT,
    description: 'Type of profile to update (student or professor)',
  })
  @IsEnum(ProfileType)
  type!: ProfileType;
}
