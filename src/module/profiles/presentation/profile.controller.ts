// src/modules/profiles/presentation/profiles.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { Public } from 'src/module/auth/infrastructure/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

import { ProfilesService } from '../application/profile.service';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateCompleteProfileDto } from './dtos/update-complete-profile.dto';
import {
  UpdateCompleteProfileQueryDto,
  ProfileType,
} from './dtos/update-complete-profile-query.dto';
import { CompleteProfileResponseDto } from './dtos/complete-profile-response.dto';
import { Profile } from '../domain/profile.entity';

@Public()
@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly service: ProfilesService) {}

  // CREATE
  @Post()
  @ApiOperation({
    summary: 'Crear un perfil (requiere user_id existente en Users)',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: CreateProfileDto })
  @ApiResponse({ status: 201, description: 'Perfil creado', type: Profile })
  async create(@Body() dto: CreateProfileDto): Promise<Profile> {
    return this.service.create(dto);
  }

  // GET (unificado: simple o paginado)
  @Get()
  @ApiOperation({
    summary: 'Listar perfiles (opcionalmente paginado)',
    description:
      'Si se envían "page" y/o "limit", se devuelve { data, meta }. De lo contrario, un arreglo simple.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Listado de perfiles (array) o paginado (data+meta)',
    type: [Profile],
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<Profile[] | PaginationResult<Profile>> {
    const { page, limit } = query;

    if (page !== undefined || limit !== undefined) {
      const p = page ?? 1;
      const l = limit ?? 10;
      return this.service.findAllPaginated(p, l);
    }

    return this.service.findAll();
  }

  // GET detalle
  @Get(':user_id')
  @ApiOperation({ summary: 'Obtener un perfil por user_id' })
  @ApiResponse({ status: 200, type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async findOne(@Param('user_id') user_id: string): Promise<Profile> {
    return this.service.findOne(user_id);
  }

  // UPDATE
  @Patch(':user_id')
  @ApiOperation({ summary: 'Actualizar un perfil por user_id' })
  @ApiConsumes('application/json')
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async update(
    @Param('user_id') user_id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.service.update(user_id, dto);
  }

  // DELETE (soft)
  @Delete(':user_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete de un perfil' })
  @ApiResponse({ status: 204, description: 'Eliminado (soft)' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async remove(@Param('user_id') user_id: string): Promise<void> {
    await this.service.remove(user_id);
  }

  // @Patch(':user_id/complete')
  // @ApiOperation({
  //   summary: 'Update complete profile (profile + student/professor data)',
  //   description:
  //     'Updates user, profile, and role-specific data (student or professor). CI and CU cannot be changed. Admin and Guest profiles cannot be updated.',
  // })
  // @ApiQuery({
  //   name: 'type',
  //   enum: ProfileType,
  //   description: 'Type of profile to update (student or professor)',
  //   required: true,
  // })
  // @ApiConsumes('application/json')
  // @ApiBody({ type: UpdateCompleteProfileDto })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Profile updated successfully',
  //   type: CompleteProfileResponseDto,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Bad Request - Type mismatch or validation error',
  // })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Forbidden - Cannot update admin or guest profiles',
  // })
  // @ApiResponse({ status: 404, description: 'Profile not found' })
  // async updateComplete(
  //   @Param('user_id') user_id: string,
  //   @Query() query: UpdateCompleteProfileQueryDto,
  //   @Body() dto: UpdateCompleteProfileDto,
  // ): Promise<CompleteProfileResponseDto> {
  //   return this.service.updateCompleteProfile(user_id, dto, query.type);
  // }
}
