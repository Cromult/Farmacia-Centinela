// src/modules/medications/application/services/medications.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  Logger,
  ConflictException,
} from '@nestjs/common';

import type { IMedicationRepository } from '../../domain/medications.repository.interface';
import { Medication } from '../../domain/medications.entity';
import { MedicationsDoc } from '../../../medications-doc/domain/medications-doc.entity';

import { MediaService } from 'src/module/media/applications/media.service';
import { MedicationsDocService } from 'src/module/medications-doc/application/medications-doc.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Express } from 'express';

type CreateMedicationParams = {
  prescription_id: string;
  nombre: string;
  descripcion: string;
  dosis: string;
  cantidad: number;
  frecuencia_horas: number;
  duracion_dias: number;
  via_administracion?: string;
  files: Express.Multer.File[];
  actorId: string;
  options?: { includeUrls?: boolean; exp?: number };
};

type UpdateMedicationParams = {
  id: string;
  nombre?: string;
  descripcion?: string;
  dosis?: string;
  cantidad?: number;
  frecuencia_horas?: number;
  duracion_dias?: number;
  via_administracion?: string;
  files?: Express.Multer.File[];
  keep_doc_ids?: string[];
  actorId: string;
  options?: { includeUrls?: boolean; exp?: number; dryRun?: boolean };
};

type UpdateMedicationImageParams = {
  id: string;
  keep_doc_ids?: string[];
  files?: Express.Multer.File[];
  actorId: string;
  options?: { includeUrls?: boolean; exp?: number };
};

@Injectable()
export class MedicationService {
  private readonly logger = new Logger(MedicationService.name);

  constructor(
    @Inject('IMedicationRepository')
    private readonly medicationRepo: IMedicationRepository,

    private readonly media: MediaService,
    private readonly medicationDocService: MedicationsDocService,
    private readonly httpService: HttpService,
  ) {}

  async findAllPaginated(params: {
    page?: number;
    limit?: number;
    options?: { includeUrls?: boolean; exp?: number };
  }) {
    const { page = 1, limit = 10, options } = params;
    const includeUrls = options?.includeUrls ?? true;
    const exp = options?.exp ?? 3600;

    const paginated = await this.medicationRepo.findAllPaginated(page, limit);

    if (includeUrls) {
      const allDocs = paginated.data.flatMap(
        (s) => (s as any).submission_docs ?? [],
      );

      const uniqueMediaIds = Array.from(
        new Set(
          allDocs
            .map((d: any) => d.media_id)
            .filter((id): id is string => !!id && typeof id === 'string'),
        ),
      );

      const mediaUrlMap: Record<string, string | null> = {};
      await Promise.all(
        uniqueMediaIds.map(async (mid) => {
          try {
            mediaUrlMap[mid] = await this.media.getPresignedUrl(mid, exp);
          } catch {
            mediaUrlMap[mid] = null;
          }
        }),
      );

      const docsUrlByDocId: Record<string, string | null> = {};
      allDocs.forEach((d: any) => {
        const mid = d.media_id as string | null | undefined;
        docsUrlByDocId[d.id] = mid ? (mediaUrlMap[mid] ?? null) : null;
      });

      return { ...paginated, docsUrls: docsUrlByDocId };
    }

    return paginated;
  }
  // -------------------------
  // CREATE
  // -------------------------
  async create(params: CreateMedicationParams): Promise<{
    medication: Medication;
    medications_docs?: MedicationsDoc[];
    docs_urls?: Record<string, string | null>;
  }> {
    const {
      prescription_id,
      nombre,
      descripcion,
      dosis,
      cantidad,
      frecuencia_horas,
      duracion_dias,
      via_administracion,
      files,
      actorId,
      options,
    } = params;

    const includeUrls = options?.includeUrls ?? true;
    const exp = options?.exp ?? 3600;

    if (!prescription_id?.trim())
      throw new BadRequestException('prescription_id requerido');

    if (!nombre?.trim()) throw new BadRequestException('nombre requerido');

    if (!files?.length)
      throw new BadRequestException('Al menos un archivo es requerido');

    const medication = new Medication({
      prescription_id: prescription_id.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      dosis: dosis.trim(),
      cantidad,
      frecuencia_horas,
      duracion_dias,
      via_administracion,
    });

    const saved = await this.medicationRepo.create(medication);

    const createdMediaIds: string[] = [];
    const savedDocs: MedicationsDoc[] = [];
    const docsUrls: Record<string, string | null> = {};

    try {
      for (const file of files) {
        const uploaded = await this.media.uploadBuffer({
          fileBuffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          metadata: {
            module: 'medications',
            type: 'file',
            medication_id: saved.id,
            user_id: actorId,
          },
        });

        createdMediaIds.push(uploaded.id);

        const md = new MedicationsDoc();
        md.medication = saved;
        md.medication_id = saved.id;
        md.media_id = uploaded.id;

        const savedDoc = await this.medicationRepo.addDocToMedication(
          saved.id,
          md,
        );

        savedDocs.push(savedDoc);

        if (includeUrls) {
          try {
            docsUrls[savedDoc.id] = await this.media.getPresignedUrl(
              savedDoc.media_id!,
              exp,
            );
          } catch {
            docsUrls[savedDoc.id] = null;
          }
        }
      }

      return {
        medication: saved,
        medications_docs: savedDocs,
        docs_urls: docsUrls,
      };
    } catch (err) {
      if (createdMediaIds.length) {
        await Promise.allSettled(
          createdMediaIds.map((id) => this.media.remove(id)),
        );
      }
      throw err;
    }
  }

  // -------------------------
  // FIND BY ID
  // -------------------------
  async findById(params: {
    id: string;
    options?: { includeUrls?: boolean; exp?: number };
  }) {
    const { id, options } = params;

    const includeUrls = options?.includeUrls ?? true;
    const exp = options?.exp ?? 3600;

    const medication = await this.medicationRepo.findById(id);
    if (!medication) throw new NotFoundException('Medication not found');

    const docsUrls: Record<string, string | null> = {};

    if (includeUrls && medication.medications_docs?.length) {
      await Promise.all(
        medication.medications_docs.map(async (d) => {
          if (!d.media_id) {
            docsUrls[d.id] = null;
            return;
          }
          try {
            docsUrls[d.id] = await this.media.getPresignedUrl(d.media_id, exp);
          } catch {
            docsUrls[d.id] = null;
          }
        }),
      );
    }

    return { medication, docsUrls };
  }

  // -------------------------
  // UPDATE (PATCH + FILES)
  // -------------------------
  async update(params: UpdateMedicationParams): Promise<{
    medication: Medication;
    new_docs?: MedicationsDoc[];
    docs_urls?: Record<string, string | null>;
  }> {
    const {
      id,
      nombre,
      descripcion,
      dosis,
      cantidad,
      duracion_dias,
      via_administracion,
      frecuencia_horas,
      files,
      keep_doc_ids,
      actorId,
      options,
    } = params;

    const includeUrls = options?.includeUrls ?? true;
    const exp = options?.exp ?? 3600;
    const dryRun = options?.dryRun === true;

    const existing = await this.medicationRepo.findById(id);
    if (!existing) throw new NotFoundException('Medication not found');

    // 1️⃣ Update metadata
    const payload: Partial<Medication> = {};
    if (nombre !== undefined) payload.nombre = nombre;
    if (descripcion !== undefined) payload.descripcion = descripcion;
    if (dosis !== undefined) payload.dosis = dosis;
    if (cantidad !== undefined) payload.cantidad = cantidad;
    if (duracion_dias !== undefined) payload.duracion_dias = duracion_dias;
    if (via_administracion !== undefined)
      payload.via_administracion = via_administracion;
    if (frecuencia_horas !== undefined)
      payload.frecuencia_horas = frecuencia_horas;

    // 🔒 DEFENSIVE: Remove empty strings to prevent DB errors
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof Medication] === '') {
        delete payload[key as keyof Medication];
      }
    });

    const updated = await this.medicationRepo.update(id, payload);

    // 2️⃣ Eliminar docs no mantenidos
    if (Array.isArray(keep_doc_ids)) {
      const existingDocs = await this.medicationRepo.findDocsByMedication(id);

      const docsToRemove = existingDocs.filter(
        (d) => !keep_doc_ids.includes(d.id),
      );

      for (const doc of docsToRemove) {
        const fullDoc = await this.medicationDocService.findById(doc.id);
        if (!fullDoc) continue;

        if (fullDoc.media_id) {
          await this.media.remove(fullDoc.media_id);
        }

        await this.medicationRepo.removeDocFromMedication(id, doc.id);
      }
    }

    // 3️⃣ Subir nuevos archivos
    if (!files?.length || dryRun) {
      return { medication: updated };
    }

    const createdMediaIds: string[] = [];
    const newDocs: MedicationsDoc[] = [];
    const docsUrls: Record<string, string | null> = {};

    try {
      for (const file of files) {
        const uploaded = await this.media.uploadBuffer({
          fileBuffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          metadata: {
            module: 'medications',
            type: 'file',
            medication_id: id,
            user_id: actorId,
          },
        });

        createdMediaIds.push(uploaded.id);

        const md = new MedicationsDoc();
        md.medication = updated;
        md.medication_id = id;
        md.media_id = uploaded.id;

        const saved = await this.medicationRepo.addDocToMedication(id, md);
        newDocs.push(saved);

        if (includeUrls && saved.media_id) {
          try {
            docsUrls[saved.id] = await this.media.getPresignedUrl(
              saved.media_id,
              exp,
            );
          } catch {
            docsUrls[saved.id] = null;
          }
        }
      }

      return { medication: updated, new_docs: newDocs, docs_urls: docsUrls };
    } catch (err) {
      if (createdMediaIds.length) {
        await Promise.allSettled(
          createdMediaIds.map((id) => this.media.remove(id)),
        );
      }
      throw err;
    }
  }

  // -------------------------
  // UPDATE IMAGE ONLY
  // -------------------------
  async updateImage(params: UpdateMedicationImageParams): Promise<{
    medication: Medication;
    new_docs?: MedicationsDoc[];
    docs_urls?: Record<string, string | null>;
  }> {
    const { id, keep_doc_ids, files, actorId, options } = params;

    const includeUrls = options?.includeUrls ?? true;
    const exp = options?.exp ?? 3600;

    const existing = await this.medicationRepo.findById(id);
    if (!existing) throw new NotFoundException('Medication not found');

    // 1️⃣ Eliminar docs no mantenidos
    if (keep_doc_ids !== undefined) {
      const existingDocs = await this.medicationRepo.findDocsByMedication(id);

      const docsToRemove = existingDocs.filter(
        (d) => !keep_doc_ids.includes(d.id),
      );

      for (const doc of docsToRemove) {
        const fullDoc = await this.medicationDocService.findById(doc.id);
        if (!fullDoc) continue;

        if (fullDoc.media_id) {
          await this.media.remove(fullDoc.media_id);
        }

        await this.medicationRepo.removeDocFromMedication(id, doc.id);
      }
    }

    // 2️⃣ Subir nuevos archivos y extraer Vectores DINOv2
    if (!files?.length) {
      return { medication: existing };
    }

    const createdMediaIds: string[] = [];
    const newDocs: MedicationsDoc[] = [];
    const docsUrls: Record<string, string | null> = {};

    try {
      for (const file of files) {
        // A) Subir a MinIO
        const uploaded = await this.media.uploadBuffer({
          fileBuffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          metadata: {
            module: 'medications',
            type: 'file',
            medication_id: id,
            user_id: actorId,
          },
        });
        createdMediaIds.push(uploaded.id);

        // B) Obtener URL temporal para que Python pueda ver la imagen
        const tempUrlForPython = await this.media.getPresignedUrl(
          uploaded.id,
          600,
        ); // 10 mins es suficiente para la IA

        // C) Consumir el Microservicio de IA
        let extractedVector: number[] = [];
        try {
          const pythonApiUrl =
            'https://cj0n1l0x-8000.brs.devtunnels.ms/api/vision/extract'; // Ajusta esto a tu entorno (ej. variables de entorno)

          const response = await firstValueFrom(
            this.httpService.post<{ vector: number[] }>(pythonApiUrl, {
              image_url: tempUrlForPython,
            }),
          );

          extractedVector = response.data.vector;
        } catch (error: any) {
          // Si YOLO rechaza la imagen, capturamos el mensaje de Python
          const mensajeError =
            error.response?.data?.detail ||
            'Error de conexión con el motor de IA.';
          throw new BadRequestException(
            `Fallo en la imagen ${file.originalname}: ${mensajeError}`,
          );
        }

        // D) Guardar Entidad con el Vector
        const md = new MedicationsDoc();
        md.medication = existing;
        md.medication_id = id;
        md.media_id = uploaded.id;
        md.embedding_vector = extractedVector; // Asignamos el vector de la IA

        const saved = await this.medicationRepo.addDocToMedication(id, md);
        newDocs.push(saved);

        // E) Generar URLs para la respuesta del frontend
        if (includeUrls && saved.media_id) {
          try {
            docsUrls[saved.id] = await this.media.getPresignedUrl(
              saved.media_id,
              exp,
            );
          } catch {
            docsUrls[saved.id] = null;
          }
        }
      }

      return { medication: existing, new_docs: newDocs, docs_urls: docsUrls };
    } catch (err) {
      // ⚠️ ROLLBACK: Si la IA falla o la BD falla, borramos la basura de MinIO
      if (createdMediaIds.length) {
        await Promise.allSettled(
          createdMediaIds.map((id) => this.media.remove(id)),
        );
      }
      throw err;
    }
  }

  // -------------------------
  // DELETE
  // -------------------------
  async softDelete(id: string): Promise<void> {
    const existing = await this.medicationRepo.findById(id);
    if (!existing) throw new NotFoundException('Medication not found');

    await this.medicationRepo.softDelete(id);
  }

  // -------------------------
  // ADD EXISTING MEDIA
  // -------------------------
  async addExistingMediaAsDoc(
    medicationId: string,
    mediaId: string,
  ): Promise<MedicationsDoc> {
    const medication = await this.medicationRepo.findById(medicationId);
    if (!medication) throw new NotFoundException('Medication not found');

    const docs = await this.medicationRepo.findDocsByMedication(medicationId);

    if (docs.some((d) => d.media_id === mediaId)) {
      throw new ConflictException('Media already linked');
    }

    const md = new MedicationsDoc();
    md.medication = medication;
    md.medication_id = medicationId;
    md.media_id = mediaId;

    return this.medicationRepo.addDocToMedication(medicationId, md);
  }
  async findByPrescriptionId(params: {
    prescriptionId: string;
    page?: number;
    limit?: number;
    options?: { includeUrls?: boolean; exp?: number };
  }) {
    const { prescriptionId, page = 1, limit = 10, options } = params;

    const includeUrls = options?.includeUrls ?? true;
    const exp = options?.exp ?? 3600;

    const paginated = await this.medicationRepo.findByPrescriptionIdPaginated(
      prescriptionId,
      page,
      limit,
    );

    if (!includeUrls) return paginated;

    const docsUrls: Record<string, string | null> = {};

    for (const med of paginated.data) {
      for (const doc of med.medications_docs || []) {
        if (!doc.media_id) {
          docsUrls[doc.id] = null;
          continue;
        }

        try {
          docsUrls[doc.id] = await this.media.getPresignedUrl(
            doc.media_id,
            exp,
          );
        } catch {
          docsUrls[doc.id] = null;
        }
      }
    }

    return { ...paginated, docsUrls };
  }

  //Mis medicamentos jwt
  async findMyLatestPrescriptionMedications(params: {
    userId: string;
    page?: number;
    limit?: number;
    options?: { exp?: number };
  }) {
    const { userId, page = 1, limit = 10, options } = params;

    const exp = options?.exp ?? 3600;
    const paginated =
      await this.medicationRepo.findMyLatestPrescriptionMedicationsPaginated({
        userId,
        page,
        limit,
      });

    const now = new Date();

    const mapped: {
      id: string;
      nombre: string;
      descripcion: string;
      dosis: string;
      cantidad: number;
      frecuencia_horas: number;
      duracion_dias: number;
      via_administracion: string;
      next_take_at: Date;
      image_url: string | null;
    }[] = [];

    for (const med of paginated.data) {
      const freqMs = med.frecuencia_horas * 60 * 60 * 1000;

      let nextTake = new Date(med.created_at);

      while (nextTake < now) {
        nextTake = new Date(nextTake.getTime() + freqMs);
      }

      let imageUrl: string | null = null;

      const docs = med.medications_docs || [];

      if (docs.length > 0) {
        const randomDoc = docs[Math.floor(Math.random() * docs.length)];

        if (randomDoc.media_id) {
          try {
            imageUrl = await this.media.getPresignedUrl(
              randomDoc.media_id,
              exp,
            );
          } catch {
            imageUrl = null;
          }
        }
      }

      mapped.push({
        id: med.id,
        nombre: med.nombre,
        descripcion: med.descripcion,
        dosis: med.dosis,
        cantidad: med.cantidad,
        frecuencia_horas: med.frecuencia_horas,
        duracion_dias: med.duracion_dias,
        via_administracion: med.via_administracion,
        next_take_at: nextTake,
        image_url: imageUrl,
      });
    }

    return {
      ...paginated,
      data: mapped,
    };
  }

  async countByPrescriptionId(prescriptionId: string): Promise<number> {
    return this.medicationRepo.countByPrescriptionId(prescriptionId);
  }

  async findLightweightByPrescriptionIds(prescriptionIds: string[]) {
    return this.medicationRepo.findLightweightByPrescriptionIds(
      prescriptionIds,
    );
  }
}
