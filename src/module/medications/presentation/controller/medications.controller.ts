// src/modules/medications/presentation/controller/medications.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import type { Express, Request as ExpressRequest } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

import { MedicationService } from '../../application/services/medications.service';

import { CreateMedicationWithFileDto } from '../dtos/create-medications-with-file.dto';
import { UpdateMedicationWithFileDto } from '../dtos/update-medications-with-file.dto';
import { UpdateMedicationImageDto } from '../dtos/update-medications-image.dto';
import { GetMedicationDto } from '../dtos/get-medications.dto';

import { PaginationResult } from 'src/utils/types/pagination-result.interface';

import { Public } from 'src/module/auth/infrastructure/decorators/public.decorator';
import { JwtAuthGuard } from 'src/module/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { GetMyMedicationDto } from '../dtos/get-my-medications.dto';
type RequestWithUser = ExpressRequest & {
  user?: { sub: string };
};

@ApiTags('medications')
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationService: MedicationService) {}

  // =========================
  // LIST ALL
  // =========================
  @Public()
  @Get()
  @ApiOperation({ summary: 'List all medications (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeUrls', required: false, type: Boolean })
  @ApiQuery({ name: 'exp', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async listAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('includeUrls', new DefaultValuePipe(true)) includeUrls?: boolean,
    @Query('exp', new DefaultValuePipe(3600), ParseIntPipe) exp?: number,
  ): Promise<
    PaginationResult<GetMedicationDto> & {
      docsUrls?: Record<string, string | null>;
    }
  > {
    const paginated = await this.medicationService.findAllPaginated({
      page,
      limit,
      options: { includeUrls, exp },
    });

    const dataDtos = paginated.data.map((m: any) =>
      GetMedicationDto.fromEntity(m, undefined),
    );

    return {
      ...paginated,
      data: dataDtos,
      docsUrls: (paginated as any).docsUrls,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me/latest-prescription')
  @ApiOperation({
    summary: 'My medications from latest prescription (paginated)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'exp', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async myLatestPrescription(
    @Req() req: ExpressRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('exp', new DefaultValuePipe(3600), ParseIntPipe) exp?: number,
  ): Promise<PaginationResult<GetMyMedicationDto>> {
    const userId = (req as RequestWithUser).user?.sub;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated',
      );
    }
    const paginated =
      await this.medicationService.findMyLatestPrescriptionMedications({
        userId,
        page,
        limit,
        options: { exp },
      });

    return {
      ...paginated,
      data: paginated.data.map((m: any) =>
        GetMyMedicationDto.fromData(m),
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/by-prescription/:prescriptionId')
  @ApiOperation({ summary: 'List medications by prescription (paginated)' })
  @ApiParam({ name: 'prescriptionId', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeUrls', required: false, type: Boolean })
  @ApiQuery({ name: 'exp', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async findByPrescription(
    @Param('prescriptionId') prescriptionId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('includeUrls', new DefaultValuePipe(true)) includeUrls?: boolean,
    @Query('exp', new DefaultValuePipe(3600), ParseIntPipe) exp?: number,
  ): Promise<
    PaginationResult<GetMedicationDto> & {
      docsUrls?: Record<string, string | null>;
    }
  > {
    const paginated = await this.medicationService.findByPrescriptionId({
      prescriptionId,
      page,
      limit,
      options: { includeUrls, exp },
    });

    const dataDtos = paginated.data.map((m: any) =>
      GetMedicationDto.fromEntity(m, undefined),
    );

    return {
      ...paginated,
      data: dataDtos,
      docsUrls: (paginated as any).docsUrls,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/by-prescription/:prescriptionId/count')
  @ApiOperation({ summary: 'Count medications by prescription' })
  @ApiParam({ name: 'prescriptionId', required: true })
  @ApiResponse({ status: 200 })
  async countByPrescription(
    @Param('prescriptionId') prescriptionId: string,
  ): Promise<{ total: number }> {
    const total =
      await this.medicationService.countByPrescriptionId(prescriptionId);

    return { total };
  }

  @Public()
  @Get('/lightweight')
  @ApiOperation({
    summary: 'Get lightweight medications by multiple prescriptionIds',
  })
  @ApiQuery({
    name: 'prescriptionIds',
    required: true,
    type: String,
    description: 'Comma separated prescription IDs',
  })
  @ApiResponse({ status: 200 })
  async findLightweight(
    @Query('prescriptionIds') prescriptionIdsRaw: string,
  ) {
    const prescriptionIds = prescriptionIdsRaw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    return this.medicationService.findLightweightByPrescriptionIds(
      prescriptionIds,
    );
  }

  // =========================
  // CREATE
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create medication with files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMedicationWithFileDto })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ status: 201, type: GetMedicationDto })
  async create(
    @Req() req: ExpressRequest,
    @Body() dto: CreateMedicationWithFileDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('includeUrls', new DefaultValuePipe(true)) includeUrls?: boolean,
    @Query('exp', new DefaultValuePipe(3600), ParseIntPipe) exp?: number,
  ): Promise<GetMedicationDto> {
    const userId = (req as any).user?.sub;

    if (!userId)
      throw new UnauthorizedException('User must be authenticated');

    const result = await this.medicationService.create({
      prescription_id: dto.prescription_id,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      dosis: dto.dosis,
      frecuencia_horas: dto.frecuencia_horas,
      cantidad: dto.cantidad,
      duracion_dias: dto.duracion_dias,
      via_administracion: dto.via_administracion,
      files,
      actorId: userId,
      options: { includeUrls: Boolean(includeUrls), exp },
    });

    return GetMedicationDto.fromEntity(
      result.medication,
      result.docs_urls,
    );
  }

  // =========================
  // GET BY ID
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get medication by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'includeUrls', required: false, type: Boolean })
  @ApiQuery({ name: 'exp', required: false, type: Number })
  @ApiResponse({ status: 200, type: GetMedicationDto })
  async findOne(
    @Param('id') id: string,
    @Query('includeUrls', new DefaultValuePipe(true)) includeUrls?: boolean,
    @Query('exp', new DefaultValuePipe(3600), ParseIntPipe) exp?: number,
  ): Promise<GetMedicationDto> {
    const { medication, docsUrls } =
      await this.medicationService.findById({
        id,
        options: { includeUrls: Boolean(includeUrls), exp },
      });

    return GetMedicationDto.fromEntity(medication, docsUrls);
  }

  // =========================
  // UPDATE
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update medication and manage files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateMedicationWithFileDto })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ status: 200, type: GetMedicationDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationWithFileDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @CurrentUser() user?: { sub: string },
    @Query('includeUrls', new DefaultValuePipe(true)) includeUrls?: boolean,
    @Query('exp', new DefaultValuePipe(3600), ParseIntPipe) exp?: number,
  ): Promise<GetMedicationDto> {
    const actorId = user?.sub ?? 'SYSTEM';

    const result = await this.medicationService.update({
      id,
      nombre: dto.nombre,
      dosis: dto.dosis,
      frecuencia_horas: dto.frecuencia_horas,
      keep_doc_ids: dto.keep_doc_ids,
      files,
      actorId,
      options: { includeUrls: Boolean(includeUrls), exp },
    });

    return GetMedicationDto.fromEntity(
      result.medication,
      result.docs_urls,
    );
  }

  // =========================
  // UPDATE IMAGE ONLY
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/image')
  @ApiOperation({ summary: 'Update medication image only (manage docs)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateMedicationImageDto })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ status: 200, type: GetMedicationDto })
  async updateImage(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationImageDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @CurrentUser() user?: { sub: string },
    @Query('includeUrls', new DefaultValuePipe(true)) includeUrls?: boolean,
    @Query('exp', new DefaultValuePipe(3600), ParseIntPipe) exp?: number,
  ): Promise<GetMedicationDto> {
    const actorId = user?.sub ?? 'SYSTEM';

    const result = await this.medicationService.updateImage({
      id,
      keep_doc_ids: dto.keep_doc_ids,
      files,
      actorId,
      options: { includeUrls: Boolean(includeUrls), exp },
    });

    return GetMedicationDto.fromEntity(
      result.medication,
      result.docs_urls,
    );
  }

  // =========================
  // DELETE
  // =========================
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete medication' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.medicationService.softDelete(id);
  }

  // =========================
  // ADD EXISTING MEDIA
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post(':id/docs/by-media/:mediaId')
  @ApiOperation({ summary: 'Attach existing media to medication' })
  async addExistingMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.medicationService.addExistingMediaAsDoc(id, mediaId);
  }
}
