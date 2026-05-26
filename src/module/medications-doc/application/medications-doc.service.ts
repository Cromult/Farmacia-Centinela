// src/modules/medications-docs/application/medications-doc.service.ts
import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import type { IMedicationsDocRepository } from 'src/module/medications-doc/domain/medications-doc.repository.interface';
import { MedicationsDoc } from '../domain/medications-doc.entity';
import { CreateMedicationsDocDto } from '../presentation/dtos/create-medications-doc.dto';
import { GetMedicationsDocDto } from '../presentation/dtos/get-medications-doc.dto';
import { UpdateMedicationsDocDto } from '../presentation/dtos/update-medications-doc.dto';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';
import { MediaService } from '../../media/applications/media.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class MedicationsDocService {
  constructor(
    @Inject('IMedicationsDocRepository')
    private readonly repository: IMedicationsDocRepository,

    private readonly mediaService: MediaService,
    private readonly httpService: HttpService,
  ) {}

  // =========================
  // Helpers
  // =========================

  private async toGetDto(
    doc: MedicationsDoc,
    options?: { includeMediaUrl?: boolean; exp?: number },
  ): Promise<GetMedicationsDocDto> {
    const includeMediaUrl = options?.includeMediaUrl ?? false;
    const exp = options?.exp ?? 3600;

    let mediaUrl: string | null | undefined = undefined;
    if (includeMediaUrl && doc.media_id) {
      try {
        mediaUrl = await this.mediaService.getPresignedUrl(doc.media_id, exp);
      } catch {
        mediaUrl = null;
      }
    }

    return GetMedicationsDocDto.fromEntity(doc, mediaUrl ?? undefined);
  }

  private async toGetDtoArray(
    docs: MedicationsDoc[],
    options?: { includeMediaUrl?: boolean; exp?: number },
  ): Promise<GetMedicationsDocDto[]> {
    const include = options?.includeMediaUrl ?? false;
    if (!include) {
      return docs.map((d) => GetMedicationsDocDto.fromEntity(d));
    }

    const exp = options?.exp ?? 3600;
    const concurrency = 5;
    const result: GetMedicationsDocDto[] = [];

    for (let i = 0; i < docs.length; i += concurrency) {
      const batch = docs.slice(i, i + concurrency);
      const urls = await Promise.all(
        batch.map(async (d) => {
          if (!d.media_id) return undefined;
          try {
            return await this.mediaService.getPresignedUrl(d.media_id, exp);
          } catch {
            return null;
          }
        }),
      );

      for (let j = 0; j < batch.length; j++) {
        result.push(GetMedicationsDocDto.fromEntity(batch[j], urls[j] ?? undefined));
      }
    }
    return result;
  }

  // =========================
  // Listados
  // =========================

  async findAll(
    includeMediaUrl = false,
    exp = 3600,
  ): Promise<GetMedicationsDocDto[]> {
    const items = await this.repository.findAll();
    return this.toGetDtoArray(items, { includeMediaUrl, exp });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    includeMediaUrl = false,
    exp = 3600,
  ): Promise<PaginationResult<GetMedicationsDocDto>> {
    const { data, meta } = await this.repository.findAllPaginated(page, limit);
    const mapped = await this.toGetDtoArray(data, { includeMediaUrl, exp });
    return { data: mapped, meta };
  }

  // =========================
  // Detalle
  // =========================

  async findById(
    id: string,
    includeMediaUrl = true,
    exp = 3600,
  ): Promise<GetMedicationsDocDto> {
    const doc = await this.repository.findById(id);
    if (!doc) throw new NotFoundException(`Document with ID ${id} not found`);
    return this.toGetDto(doc, { includeMediaUrl, exp });
  }

  // =========================
  // Crear
  // =========================

  async create(dto: CreateMedicationsDocDto): Promise<GetMedicationsDocDto> {
    // 🔸 Si quisieras validar la medication:
    // const medication = await this.assertMedicationExists(dto.medication_id);

    const doc = new MedicationsDoc({
      medication_id: dto.medication_id, // FK comentada si medication no existe
      media_id: dto.media_id,           // opcional, 1–1 Media
    });

    const saved = await this.repository.create(doc);
    return this.toGetDto(saved, { includeMediaUrl: false });
  }

  async createWithMedia(
    dto: CreateMedicationsDocDto,
    file?: Express.Multer.File,
  ): Promise<GetMedicationsDocDto> {
    const doc = new MedicationsDoc({
      medication_id: dto.medication_id,
    });

    let created = await this.repository.create(doc);

    if (file && file.buffer) {
      const media = await this.mediaService.uploadBuffer({
        fileBuffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        metadata: { module: 'medications-docs', type: 'document', docId: created.id },
      });

      created = await this.repository.update(created.id, { media_id: media.id });
    }

    return this.toGetDto(created, { includeMediaUrl: true });
  }

  // =========================
  // Actualizar
  // =========================

  async update(id: string, dto: UpdateMedicationsDocDto): Promise<GetMedicationsDocDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException(`Document with ID ${id} not found`);

    const patched: Partial<MedicationsDoc> = {
      media_id: dto.media_id ?? existing.media_id,
      // medication_id: dto.medication_id ?? existing.medication_id, // 🔸 comentado
    };

    const saved = await this.repository.update(id, patched);
    return this.toGetDto(saved, { includeMediaUrl: false });
  }

  // =========================
  // Borrado (soft)
  // =========================

  async softDelete(id: string): Promise<void> {
    await this.findById(id, false);
    await this.repository.softDelete(id);
  }

  // =========================
  // Utilidades opcionales
  // =========================

  async setMediaFile(
    docId: string,
    file: Express.Multer.File,
    exp = 3600,
  ): Promise<GetMedicationsDocDto> {
    const doc = await this.repository.findById(docId);
    if (!doc) throw new NotFoundException(`Document with ID ${docId} not found`);

    const media = await this.mediaService.uploadBuffer({
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      metadata: { module: 'medications-docs', type: 'document', docId },
    });

    doc.media_id = media.id;
    const saved = await this.repository.update(docId, doc);
    const url = await this.mediaService.getPresignedUrl(media.id, exp);
    return GetMedicationsDocDto.fromEntity(saved, url);
  }

  async detachMedia(docId: string): Promise<GetMedicationsDocDto> {
    const doc = await this.repository.findById(docId);
    if (!doc) throw new NotFoundException(`Document with ID ${docId} not found`);

    doc.media_id = null as any;
    const saved = await this.repository.update(docId, doc);
    return this.toGetDto(saved, { includeMediaUrl: false });
  }
}
