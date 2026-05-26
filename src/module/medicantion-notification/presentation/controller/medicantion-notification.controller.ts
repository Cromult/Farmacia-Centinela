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

import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@Public()
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
  @ApiConsumes('multipart/form-data') // Clave para recibir imagen y datos
  @ApiBody({ type: CreateMedicantionNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notificación creada y pastilla verificada',
  })
  @UseInterceptors(FileInterceptor('file')) // Extrae el archivo llamado "file"
  async create(
    @Body() dto: CreateMedicantionNotificationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe subir una foto de la pastilla para verificarla.',
      );
    }

    const entity = await this.mediaService.createWithValidation(dto, file);
    return GetMedicantionNotificationDto.fromEntity(entity);
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
