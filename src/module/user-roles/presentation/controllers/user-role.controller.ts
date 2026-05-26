import { Controller, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserRoleService } from '../../application/user-role.service';
import { CreateUserRoleDto } from '../dtos/create-user-role.dto';
import { Public } from 'src/module/auth/infrastructure/decorators/public.decorator';

@ApiTags('User Roles')
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly service: UserRoleService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Asignar un rol a un usuario' })
  async create(@Body() dto: CreateUserRoleDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un rol' })
  async remove(@Param('id') id: string) {
    await this.service.delete(Number(id));
  }
}
