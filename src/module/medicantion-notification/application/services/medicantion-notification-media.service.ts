// src/module/medicantion-notification/application/services/medicantion-notification.service.ts

import {
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
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
    file: Express.Multer.File,
  ): Promise<MedicantionNotification> {
    
    // 1️⃣ Obtener la medicina usando tu servicio existente
    // Ponemos includeUrls en false para no sobrecargar a MinIO generando URLs que no usaremos aquí.
    const { medication } = await this.medicationAppService.findById({
      id: dto.medication_id,
      options: { includeUrls: false },
    });

    // 2️⃣ Extraer todos los vectores de referencia de los documentos de esa medicina
    const referenceVectors: number[][] = [];
    if (medication.medications_docs && medication.medications_docs.length > 0) {
      for (const doc of medication.medications_docs) {
        if (doc.embedding_vector && doc.embedding_vector.length > 0) {
          referenceVectors.push(doc.embedding_vector);
        }
      }
    }

    // Si la medicina no tiene fotos previas registradas con vectores, bloqueamos el proceso
    if (referenceVectors.length === 0) {
      throw new BadRequestException(
        `El medicamento ${medication.nombre} no tiene imágenes de referencia registradas para hacer la comparación.`,
      );
    }

    // 3️⃣ Subir la foto "en caliente" del paciente a MinIO de forma temporal
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

    let esPastillaCorrecta = false;
    let mensajeErrorIA = 'Error desconocido al validar el medicamento.';

    try {
      // 4️⃣ Generar URL presignada corta (Válida por 5 minutos / 300 segundos)
      const tempUrlForPython = await this.mediaService.getPresignedUrl(
        uploadedTempMedia.id,
        300,
      );

      // 5️⃣ Llamar al microservicio de Python (Comparación en caliente)
      // Asegúrate de que esta URL apunte al host de tu FastAPI
      const pythonApiUrl = 'http://localhost:8000/api/vision/verify';

      const response = await firstValueFrom(
        this.httpService.post(pythonApiUrl, {
          image_url: tempUrlForPython,
          reference_vectors: referenceVectors,
          threshold: 0.61, // Umbral de rigurosidad (85% de similitud mínima)
        }),
      );

      esPastillaCorrecta = response.data.verified;

      if (!esPastillaCorrecta) {
        const similitudLograda = (response.data.best_similarity * 100).toFixed(1);
        mensajeErrorIA = `Peligro: La pastilla mostrada no coincide con ${medication.nombre}. Similitud alcanzada: ${similitudLograda}%`;
      }
    } catch (error: any) {
      // Manejar si YOLO no detectó nada (HTTP 400 desde Python) o si FastAPI está caído
      esPastillaCorrecta = false;
      mensajeErrorIA =
        error.response?.data?.detail ||
        'No se detectó ninguna medicina clara en la imagen enviada.';
    } finally {
      // 6️⃣ LIMPIEZA OBLIGATORIA
      // El bloque finally asegura que, pase lo que pase, la foto del paciente se borre de MinIO
      await this.mediaService
        .remove(uploadedTempMedia.id)
        .catch((e) =>
          console.error(`Error limpiando MinIO (ID: ${uploadedTempMedia.id}):`, e),
        );
    }

    // 7️⃣ Decisión Final
    if (!esPastillaCorrecta) {
      // Cortamos el flujo con BadRequest para que Flutter muestre la alerta al adulto mayor
      throw new BadRequestException(mensajeErrorIA);
    }

    // 8️⃣ Si todo fue correcto (✅ VERIFICADO), guardamos el registro de la toma
    const notification = new MedicantionNotification();
    notification.medication_id = dto.medication_id.trim();
    notification.estado = dto.estado as any;
    notification.frecuencias_horas = dto.frecuencias_horas;

    if (dto.tiempo_tomado) {
      notification.tiempo_tomado = new Date(dto.tiempo_tomado);
    } else {
      notification.tiempo_tomado = new Date();
    }

    return this.notificationRepo.create(notification);
  }
}