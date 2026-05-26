import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req, UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserService } from '../../application/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { GetUserDto } from '../dtos/get-user.dto';
import { Public } from 'src/module/auth/infrastructure/decorators/public.decorator';
import { JwtAuthGuard } from 'src/module/auth/infrastructure/guards/jwt-auth.guard';
import type { Express, Request as ExpressRequest } from 'express';
type RequestWithUser = ExpressRequest & {
  user?: { sub: string };
};

import { UpdatePasswordDto } from '../dtos/update-password.dto';
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    const list = await this.service.findAll();
    return list.map(GetUserDto.fromEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @ApiOperation({
    summary: 'Update own password',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Password updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'User must be authenticated / Invalid password',
  })
  async updateMyPassword(
    @Req() req: ExpressRequest,
    @Body() dto: UpdatePasswordDto,
  ) {
    const userId = (req as RequestWithUser).user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User must be authenticated');
    }

    return this.service.updatePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return GetUserDto.fromEntity(item);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() dto: CreateUserDto) {
    return await this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const item = await this.service.update(id, dto);
    return GetUserDto.fromEntity(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    await this.service.softDelete(id);
  }
}
