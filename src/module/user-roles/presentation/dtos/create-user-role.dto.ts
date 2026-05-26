import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateUserRoleDto {
  @IsNotEmpty()
  @IsNumber()
  user_id!: number | string;

  @IsNotEmpty()
  @IsString()
  role_name!: string;
}
