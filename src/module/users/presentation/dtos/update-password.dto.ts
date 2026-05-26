// src/modules/users/presentation/dtos/update-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'OldPass123*',
  })
  @IsString()
  oldPassword!: string;

  @ApiProperty({
    example: 'NewPass456*',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
