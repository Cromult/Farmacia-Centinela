// src/module/users/presentation/dtos/create-user.dto.ts
import { IsNotEmpty, IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
