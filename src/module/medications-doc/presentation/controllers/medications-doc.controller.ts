// src/modules/medications-docs/presentation/controllers/medications-doc.controller.ts
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
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Express } from 'express';

import { MedicationsDocService } from '../../application/medications-doc.service';
import { GetMedicationsDocDto } from '../dtos/get-medications-doc.dto';
import { CreateMedicationsDocDto } from '../dtos/create-medications-doc.dto';
import { UpdateMedicationsDocDto } from '../dtos/update-medications-doc.dto';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';
import { PaginationQueryDto } from '../../../../common/dtos/pagination-query.dto';
import { Public } from 'src/module/auth/infrastructure/decorators/public.decorator';

@Public()
@ApiTags('medications-docs')
@Controller('medications-docs')
export class MedicationsDocController {
  constructor(private readonly service: MedicationsDocService) {}

  // =========================
  // LISTADOS
  // =========================
  @Get()
  @ApiOperation({ summary: 'List all medications docs (optionally paginated)' })
  @ApiResponse({ status: 200, type: [GetMedicationsDocDto] })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<GetMedicationsDocDto[] | PaginationResult<GetMedicationsDocDto>> {
    const { page, limit } = query;
    if (page !== undefined || limit !== undefined) {
      return this.service.findAllPaginated(page ?? 1, limit ?? 10);
    }
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medications doc by ID' })
  @ApiResponse({ status: 200, type: GetMedicationsDocDto })
  async findOne(@Param('id') id: string): Promise<GetMedicationsDocDto> {
    return this.service.findById(id);
  }

  // =========================
  // CREAR (multipart para archivo opcional)
  // =========================
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new medications doc with optional media file' })
  @UseInterceptors(FileInterceptor('document_file'))
  async create(
    @Body() body: CreateMedicationsDocDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<GetMedicationsDocDto> {
    return this.service.createWithMedia(body, file);
  }

  // =========================
  // UPDATE / DELETE
  // =========================
  @Patch(':id')
  @ApiOperation({ summary: 'Update a medications doc' })
  @ApiResponse({ status: 200, type: GetMedicationsDocDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationsDocDto,
  ): Promise<GetMedicationsDocDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a medications doc' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.softDelete(id);
  }

  // =========================
  // MEDIA helpers (opcional)
  // =========================
  @Post(':id/media')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('document_file'))
  @ApiOperation({ summary: 'Set/replace document media file (1–1)' })
  async setMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GetMedicationsDocDto> {
    return this.service.setMediaFile(id, file);
  }

  @Delete(':id/media')
  @ApiOperation({ summary: 'Detach current media from medications doc' })
  @ApiResponse({ status: 200, type: GetMedicationsDocDto })
  async detachMedia(@Param('id') id: string): Promise<GetMedicationsDocDto> {
    return this.service.detachMedia(id);
  }

  
}
