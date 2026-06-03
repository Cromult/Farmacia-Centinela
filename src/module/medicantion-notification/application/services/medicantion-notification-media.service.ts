// src/module/medicantion-notification/application/services/medicantion-notification.service.ts

import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Express } from 'express';

// Entidades y DTOs
import { MedicantionNotification } from '../../domain/medicantion-notification.entity';
import { CreateMedicantionNotificationDto } from '../../presentation/dtos/create-medicantion-notification.dto';
import type { IMedicantionNotificationRepository } from '../../domain/medicantion-notification.repository.interface';
// Servicios externos inyectados
import { MedicationService } from 'src/module/medications/application/services/medications.service';
import { MediaService } from 'src/module/media/applications/media.service';

@Injectable()
export class MedicantionNotificationService {
  constructor(
    // ⚠️ Asegúrate de usar la interfaz correcta de tu repositorio de notificaciones
    @Inject('IMedicantionNotificationRepository')
    private readonly notificationRepo: IMedicantionNotificationRepository,
    // Cambiamos el nombre de la variable inyectada para evitar choques de nombres
    private readonly medicationAppService: MedicationService,
    private readonly mediaService: MediaService,
    private readonly httpService: HttpService,
  ) {}

  // -------------------------
  // VALIDACIÓN CON IA Y CREACIÓN
  // -------------------------
  async createWithValidation(
    dto: CreateMedicantionNotificationDto,
    file?: Express.Multer.File, // 👈 Se hace opcional agregando el "?"
  ): Promise<any> {
    // 👈 Retornamos 'any' o creas una interface para devolver metadatos extra

    // 1️⃣ PREPARAR LA NOTIFICACIÓN BASE
    const notification = new MedicantionNotification();
    notification.medication_id = dto.medication_id.trim();
    notification.estado = dto.estado as any;
    notification.frecuencias_horas = dto.frecuencias_horas;
    notification.tiempo_tomado = dto.tiempo_tomado
      ? new Date(dto.tiempo_tomado)
      : new Date();

    // 2️⃣ FLUJO A: SI EL USUARIO NO SUBIÓ FOTO (Registro Manual)
    if (!file) {
      const savedNotification =
        await this.notificationRepo.create(notification);
      return {
        notification: savedNotification,
        mensaje: 'Toma registrada manualmente (Sin verificación visual).',
        verificacion_ia: null,
      };
    }

    // 3️⃣ FLUJO B: SI HAY FOTO, INICIA LA VERIFICACIÓN
    const { medication } = await this.medicationAppService.findById({
      id: dto.medication_id,
      options: { includeUrls: false },
    });

    const referenceVectors: number[][] = [];
    if (medication.medications_docs?.length > 0) {
      for (const doc of medication.medications_docs) {
        if (doc.embedding_vector) {
          referenceVectors.push(doc.embedding_vector);
        }
      }
    }

    if (referenceVectors.length === 0) {
      throw new BadRequestException(
        `El medicamento ${medication.nombre} no tiene imágenes base para comparar. No se puede verificar.`,
      );
    }

    const uploadedTempMedia = await this.mediaService.uploadBuffer({
      fileBuffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      metadata: {
        module: 'temp-verification',
        type: 'validation',
        medication_id: medication.id,
      },
    });

    let validacionPython: any = null;

    try {
      const tempUrlForPython = await this.mediaService.getPresignedUrl(
        uploadedTempMedia.id,
        300,
      );
      const pythonApiUrl = 'http://localhost:8000/api/vision/verify';

      const response = await firstValueFrom(
        this.httpService.post(pythonApiUrl, {
          image_url: tempUrlForPython,
          reference_vectors: referenceVectors,
          threshold: 0.61, // Rigurosidad
        }),
      );

      validacionPython = response.data;
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.detail ||
          'No se detectó ninguna medicina en la foto enviada.',
      );
    } finally {
      // LIMPIEZA OBLIGATORIA
      await this.mediaService
        .remove(uploadedTempMedia.id)
        .catch((e) => console.error(e));
    }

    // 4️⃣ TOMA DE DECISIONES DE IA
    const similitudLograda = (validacionPython.best_similarity * 100).toFixed(
      1,
    );
    const totalDetectados = validacionPython.total_detections;

    if (!validacionPython.verified) {
      // Explicamos exactamente por qué falló
      throw new BadRequestException(
        `La IA analizó ${totalDetectados} objeto(s) en la foto, pero el más parecido a ${medication.nombre} solo alcanzó un ${similitudLograda}% de similitud. (Mínimo requerido: 61%).`,
      );
    }

    // 5️⃣ SI PASA LA PRUEBA, GUARDAR Y DEVOLVER DATOS DE ÉXITO
    const savedNotification = await this.notificationRepo.create(notification);

    return {
      notification: savedNotification,
      mensaje: `¡Excelente! La IA verificó tu ${medication.nombre} con un ${similitudLograda}% de seguridad.`,
      verificacion_ia: {
        total_medicinas_en_foto: totalDetectados,
        similitud_alcanzada: `${similitudLograda}%`,
        // El front-end puede renderizar esto usando: Image.memory(base64Decode(imagen_recortada_base64)) en Flutter
        imagen_recortada_base64: validacionPython.best_match_crop_base64,
      },
    };
  }
}
