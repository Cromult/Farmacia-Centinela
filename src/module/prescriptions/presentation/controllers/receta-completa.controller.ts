// src/modules/prescriptions/presentation/controllers/receta-completa.controller.ts

import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { RecetaCompletaService } from '../../application/receta-completa.service';
import { ProcessRawPrescriptionDto } from '../dtos/process-raw-prescription.dto';

import { JwtAuthGuard } from 'src/module/auth/infrastructure/guards/jwt-auth.guard';
import type { Express, Request as ExpressRequest } from 'express';

// Tipado para el request con el usuario inyectado por el Guard
type RequestWithUser = ExpressRequest & { user?: { sub: string } };

@ApiTags('Prescriptions AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions/ai')
export class RecetaCompletaController {
  constructor(private readonly recetaCompletaService: RecetaCompletaService) {}

  @Post('process')
  @ApiOperation({ summary: 'Procesar texto libre de receta médica con Inteligencia Artificial' })
  @ApiResponse({ status: 201, description: 'Receta y medicamentos creados exitosamente.' })
  async processPrescription(
    @Req() req: ExpressRequest,
    @Body() dto: ProcessRawPrescriptionDto,
  ): Promise<any> {
    // 1. Extraemos el ID del usuario desde el token JWT (sub)
    const userId = (req as RequestWithUser).user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User must be authenticated');
    }
    // 2. Inyectamos el ID del paciente en el DTO (asumiendo que el sub del JWT es el patient_id)
    dto.patient_id = userId;

    // 3. Ejecutamos la magia
    const prescription = await this.recetaCompletaService.procesarYCrear(dto);

    return {
      message: 'Receta procesada y guardada correctamente',
      data: prescription,
    };
  }
}
