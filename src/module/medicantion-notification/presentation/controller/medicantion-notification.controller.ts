// src/module/medicantion-notification/presentation/controller/medicantion-notification.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicantionNotificationService } from '../../application/services/medicantion-notification.service';
import { MedicantionNotificationService as MedicantionNotificationServiceMedia } from '../../application/services/medicantion-notification-media.service';

import { CreateMedicantionNotificationDto } from '../dtos/create-medicantion-notification.dto';
import { UpdateMedicantionNotificationDto } from '../dtos/update-medicantion-notification.dto';
import { GetMedicantionNotificationDto } from '../dtos/get-medicantion-notification.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import type { Express, Request as ExpressRequest, Response } from 'express';
type RequestWithUser = ExpressRequest & { user?: { sub: string } };
@ApiTags('medicantion-notifications')
@Controller('medicantion-notifications')
export class MedicantionNotificationController {
  constructor(
    private readonly service: MedicantionNotificationService,
    private readonly mediaService: MedicantionNotificationServiceMedia,
  ) {}

  // -------------------------
  // CREATE
  // -------------------------
  @Post()
  @ApiOperation({
    summary: 'Validar visualmente y crear notificación de medicamento',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMedicantionNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notificación creada y pastilla verificada',
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateMedicantionNotificationDto,
    @UploadedFile() file?: Express.Multer.File, // Añade el "?" aquí también por si acaso
  ) {
    // 1. Obtenemos el resultado complejo del servicio
    const result = await this.mediaService.createWithValidation(dto, file);

    // 2. Mapeamos SOLO la entidad a través del DTO, y reconstruimos la respuesta
    return {
      notification: GetMedicantionNotificationDto.fromEntity(
        result.notification,
      ),
      mensaje: result.mensaje,
      verificacion_ia: result.verificacion_ia,
    };
  }

  @UseGuards(JwtAuthGuard) // Es vital que esté protegido para sacar el userId
  @Get('history/me')
  @ApiOperation({
    summary:
      'Obtener historial de notificaciones (Hoy y Mañana) de la receta activa',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial mapeado con descripciones',
  })
  async getHistoryMe(@Req() req: ExpressRequest): Promise<any[]> {
    // casteamos req según tu interfaz
    const userId = (req as RequestWithUser).user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.service.getDashboardHistoryMe(userId);
  }
  // -------------------------
  // FIND ALL
  // -------------------------
  @Get()
  @ApiOperation({ summary: 'Listar todas las notificaciones' })
  @ApiResponse({
    status: 200,
    type: [GetMedicantionNotificationDto],
  })
  async findAll(): Promise<GetMedicantionNotificationDto[]> {
    const data = await this.service.findAll();
    return data.map((e) => GetMedicantionNotificationDto.fromEntity(e));
  }
  // -------------------------
  // FIND BY MEDICATION
  // -------------------------
  @Get('medication/:medication_id')
  @ApiOperation({
    summary: 'Obtener notificaciones por medication_id',
  })
  @ApiResponse({
    status: 200,
    type: [GetMedicantionNotificationDto],
  })
  async findByMedication(
    @Param('medication_id') medication_id: string,
  ): Promise<GetMedicantionNotificationDto[]> {
    const data = await this.service.findByMedicationId(medication_id);
    return data.map((e) => GetMedicantionNotificationDto.fromEntity(e));
  }

  // -------------------------
  // FIND BY ID
  // -------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Obtener notificación por id' })
  @ApiResponse({
    status: 200,
    type: GetMedicantionNotificationDto,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<GetMedicantionNotificationDto> {
    const entity = await this.service.findById(id);
    return GetMedicantionNotificationDto.fromEntity(entity);
  }

  // -------------------------
  // UPDATE
  // -------------------------
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar notificación' })
  @ApiBody({ type: UpdateMedicantionNotificationDto })
  @ApiResponse({
    status: 200,
    type: GetMedicantionNotificationDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicantionNotificationDto,
  ): Promise<GetMedicantionNotificationDto> {
    const entity = await this.service.update({
      id,
      ...dto,
    });

    return GetMedicantionNotificationDto.fromEntity(entity);
  }

  // -------------------------
  // DELETE
  // -------------------------
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar notificación (soft delete)' })
  @ApiResponse({ status: 204, description: 'Sin contenido' })
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
