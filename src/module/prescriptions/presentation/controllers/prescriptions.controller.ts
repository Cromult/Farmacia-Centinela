// src/modules/prescriptions/presentation/controllers/prescriptions.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PrescriptionService } from '../../application/prescriptions.service';

import { CreatePrescriptionDto } from '../dtos/create-prescriptions.dto';
import { UpdatePrescriptionDto } from '../dtos/update-prescriptions.dto';
import { GetPrescriptionDto } from '../dtos/get-prescriptions.dto';

import { PaginationResult } from 'src/utils/types/pagination-result.interface';
import { PaginationQueryDto } from '../../../../common/dtos/pagination-query.dto';

import { Public } from 'src/module/auth/infrastructure/decorators/public.decorator';
import { JwtAuthGuard } from 'src/module/auth/infrastructure/guards/jwt-auth.guard';

import type { Express, Request as ExpressRequest } from 'express';

type RequestWithUser = ExpressRequest & { user?: { sub: string } };

@UseGuards(JwtAuthGuard)
@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get prescriptions (optionally paginated)' })
  @ApiResponse({ status: 200, type: [GetPrescriptionDto] })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<GetPrescriptionDto[] | PaginationResult<GetPrescriptionDto>> {
    const { page, limit } = query;

    // ✅ Con paginación
    if (page !== undefined || limit !== undefined) {
      const p = page ?? 1;
      const l = limit ?? 10;

      const result = await this.prescriptionService.findAllPaginated(p, l);

      return {
        ...result,
        data: result.data.map(GetPrescriptionDto.fromEntity),
      };
    }

    // ✅ Sin paginación
    const list = await this.prescriptionService.findAll();
    return list.map(GetPrescriptionDto.fromEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard/me')
  async getDashboard(@Req() req: ExpressRequest): Promise<any> {
    const userId = (req as RequestWithUser).user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User must be authenticated');
    }

    return this.prescriptionService.getDashboardByUserId(userId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Obtener el historial completo de tomas de una receta' })
  @ApiResponse({ status: 200, description: 'Historial de la receta obtenido con éxito.' })
  @ApiResponse({ status: 404, description: 'Receta no encontrada.' })
  async getHistory(@Param('id') id: string) {
    return this.prescriptionService.getPrescriptionHistory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/all')
  @ApiOperation({ summary: 'Get all prescriptions of authenticated user' })
  @ApiResponse({ status: 200, type: [GetPrescriptionDto] })
  async findMyPrescriptions(
    @Req() req: ExpressRequest,
  ): Promise<GetPrescriptionDto[]> {
    const userId = (req as RequestWithUser).user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User must be authenticated');
    }

    const prescriptions =
      await this.prescriptionService.findAllByUserId(userId);

    return prescriptions.map(GetPrescriptionDto.fromEntity);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a prescription by ID' })
  @ApiResponse({ status: 200, type: GetPrescriptionDto })
  async findOne(@Param('id') id: string): Promise<GetPrescriptionDto> {
    const prescription = await this.prescriptionService.findById(id);

    return GetPrescriptionDto.fromEntity(prescription);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, type: GetPrescriptionDto })
  async create(
    @Body() createDto: CreatePrescriptionDto,
  ): Promise<GetPrescriptionDto> {
    const prescription = await this.prescriptionService.create(createDto);

    return GetPrescriptionDto.fromEntity(prescription);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prescription by ID' })
  @ApiResponse({ status: 200, type: GetPrescriptionDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrescriptionDto,
  ): Promise<GetPrescriptionDto> {
    const prescription = await this.prescriptionService.update(id, updateDto);

    return GetPrescriptionDto.fromEntity(prescription);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a prescription by ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.prescriptionService.softDelete(id);
  }
}
