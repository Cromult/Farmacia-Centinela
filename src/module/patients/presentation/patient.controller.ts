// src/module/patients/presentation/patient.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { PatientService } from '../application/patient.service';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { Public } from '../../auth/infrastructure/decorators/public.decorator';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { GetPatientDto } from './dtos/get-patient.dto';
import { JwtAuthGuard } from 'src/module/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import type { Express, Request as ExpressRequest } from 'express';


import { PatientOrchestratorService } from '../application/patient-orchestrator.service';
import { CreatePatientUserProfileDto } from './dtos/create-patient-user-profile.dto';

type RequestWithUser = ExpressRequest & { user?: { sub: string } };


@UseGuards(JwtAuthGuard)
@ApiTags('patients')
@Controller('patients')
export class PatientController {
  constructor(
    private readonly service: PatientService,
    private readonly orchestrator: PatientOrchestratorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear paciente' })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado',
    type: GetPatientDto,
  })
  async create(@Body() dto: CreatePatientDto): Promise<GetPatientDto> {
    return this.service.create(dto);
  }
  @Public()
  @Post('full')
  @ApiOperation({ summary: 'Crear User + Profile + Patient en una sola operación' })
  @ApiBody({ type: CreatePatientUserProfileDto })
  async createFull(@Body() dto: CreatePatientUserProfileDto) {
    return this.orchestrator.createFull(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes (simple o paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, type: [GetPatientDto] })
  async findAll(
    @Query()
    query: PaginationQueryDto,
  ): Promise<GetPatientDto[] | PaginationResult<GetPatientDto>> {
    const { page, limit } = query as any;

    if (page !== undefined || limit !== undefined) {
      const p = page ? Number(page) : 1;
      const l = limit ? Number(limit) : 10;
      return this.service.findAllPaginated(p, l);
    }
    return this.service.findAll();
  }

  @Get(':user_id')
  @ApiOperation({ summary: 'Obtener un paciente por user_id' })
  @ApiResponse({ status: 200, type: GetPatientDto })
  async findOne(@Param('user_id') user_id: string): Promise<GetPatientDto> {
    return this.service.findOne(user_id);
  }

  @Patch(':user_id')
  @ApiOperation({ summary: 'Actualizar un paciente' })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({ status: 200, type: GetPatientDto })
  async update(
    @Param('user_id') user_id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<GetPatientDto> {
    return this.service.update(user_id, dto);
  }

  @Delete(':user_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un paciente (soft delete)' })
  @ApiResponse({ status: 204, description: 'Sin contenido' })
  async softDelete(@Param('user_id') user_id: string): Promise<void> {
    return this.service.softDelete(user_id);
  }
}
