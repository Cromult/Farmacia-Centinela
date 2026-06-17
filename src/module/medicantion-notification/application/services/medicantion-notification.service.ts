// src/modules/medicantion-notification/application/services/medicantion-notification.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';

import type { IMedicantionNotificationRepository } from '../../domain/medicantion-notification.repository.interface';
import { MedicantionNotification } from '../../domain/medicantion-notification.entity';
import type { IPrescriptionRepository } from 'src/module/prescriptions/domain/prescriptions.repository.interface';

@Injectable()
export class MedicantionNotificationService {
  constructor(
    @Inject('IMedicantionNotificationRepository')
    private readonly notificationRepo: IMedicantionNotificationRepository,
    @Inject('IPrescriptionRepository')
    private readonly prescriptionRepo: any,
  ) {}

  // -------------------------
  // CREATE
  // -------------------------
  async create(params: {
    medication_id: string;
    tiempo_tomado?: string;
    estado: string;
    frecuencias_horas: number;
  }): Promise<MedicantionNotification> {
    const { medication_id, tiempo_tomado, estado, frecuencias_horas } = params;

    if (!medication_id?.trim()) {
      throw new BadRequestException('medication_id requerido');
    }

    const notification = new MedicantionNotification();
    notification.medication_id = medication_id.trim();
    notification.estado = estado as any;
    notification.frecuencias_horas = frecuencias_horas;

    if (tiempo_tomado) {
      notification.tiempo_tomado = new Date(tiempo_tomado);
    }

    return this.notificationRepo.create(notification);
  }

  // -------------------------
  // FIND ALL
  // -------------------------
  async findAll(): Promise<MedicantionNotification[]> {
    return this.notificationRepo.findAll();
  }

  // -------------------------
  // FIND BY ID
  // -------------------------
  async findById(id: string): Promise<MedicantionNotification> {
    const notification = await this.notificationRepo.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  // -------------------------
  // FIND BY MEDICATION
  // -------------------------
  async findByMedicationId(
    medicationId: string,
  ): Promise<MedicantionNotification[]> {
    if (!medicationId?.trim()) {
      throw new BadRequestException('medicationId requerido');
    }

    return this.notificationRepo.findByMedicationId(medicationId);
  }

  // -------------------------
  // UPDATE
  // -------------------------
  async update(params: {
    id: string;
    tiempo_tomado?: string;
    estado?: string;
    frecuencias_horas?: number;
  }): Promise<MedicantionNotification> {
    const { id, tiempo_tomado, estado, frecuencias_horas } = params;

    const existing = await this.notificationRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    const payload: Partial<MedicantionNotification> = {};

    if (estado !== undefined) {
      payload.estado = estado as any;
    }

    if (frecuencias_horas !== undefined) {
      payload.frecuencias_horas = frecuencias_horas;
    }

    if (tiempo_tomado !== undefined) {
      payload.tiempo_tomado = tiempo_tomado
        ? new Date(tiempo_tomado)
        : undefined;
    }

    return this.notificationRepo.update(id, payload);
  }

  // -------------------------
  // DELETE (SOFT)
  // -------------------------
  async softDelete(id: string): Promise<void> {
    const existing = await this.notificationRepo.findById(id);

    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.softDelete(id);
  }
  async getDashboardHistoryMe(userId: string): Promise<any[]> {
    // 1. Traer la receta activa con TODOS los medicamentos y sus notificaciones
    const activePrescription = await this.prescriptionRepo.getDashboardByUserId(userId);

    if (!activePrescription || !activePrescription.medications) {
      return [];
    }

    const now = new Date();
    
    // 2. Definir la "Ventana de Visión": Desde HOY 00:00:00 hasta MAÑANA 23:59:59
    const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);

    const meds = activePrescription.medications.filter((m: any) => !m.deleted_at);
    const fullTimeline: any[] = [];

    // 3. Simular el tiempo para cada medicamento
    for (const med of meds) {
      const freqMs = med.frecuencia_horas * 60 * 60 * 1000;
      let currentTime = new Date(med.created_at).getTime();

      // Las notificaciones vienen de DB ordenadas DESC. Las invertimos a ASC para simular el reloj
      const realNotifs = (med.notifications || []).slice().reverse();
      let notifIndex = 0;

      // Viajamos en el tiempo desde que se creó la medicina hasta el final de mañana
      while (currentTime <= windowEnd.getTime()) {
        let foundReal = false;

        // A. ¿Hay una toma REAL en este bloque de tiempo (antes de la próxima dosis esperada)?
        while (
          notifIndex < realNotifs.length &&
          new Date(realNotifs[notifIndex].tiempo_tomado || realNotifs[notifIndex].created_at).getTime() < currentTime + freqMs
        ) {
          const realNotif = realNotifs[notifIndex];
          const realTime = new Date(realNotif.tiempo_tomado || realNotif.created_at);

          // Si la toma real cae dentro de nuestra "Ventana", la agregamos
          if (realTime.getTime() >= windowStart.getTime() && realTime.getTime() <= windowEnd.getTime()) {
            fullTimeline.push({
              id: realNotif.id,
              medication_id: med.id,
              medication_nombre: med.nombre,
              medication_descripcion: med.descripcion || '',
              tiempo_tomado: realTime,
              estado: realNotif.estado, // Ej: "TIEMPO" o "ATRASADO"
              frecuencias_horas: realNotif.frecuencias_horas || med.frecuencia_horas,
              is_virtual: false, // 🔥 Es real de la Base de Datos
            });
          }

          // La toma real REINICIA el horario de la siguiente dosis
          currentTime = realTime.getTime();
          foundReal = true;
          notifIndex++;
        }

        // B. Calcular el próximo salto temporal
        if (foundReal) {
          // Si hubo toma real, la próxima dosis es la hora de esa toma + la frecuencia
          currentTime += freqMs;
        } else {
          // Si NO hubo toma real, significa que ignoró la alarma o aún no ha llegado. Es una toma VIRTUAL.
          if (currentTime >= windowStart.getTime() && currentTime <= windowEnd.getTime()) {
            
            let virtualStatus = 'A_TOMAR'; // Por defecto, es en el futuro
            const diffMin = (currentTime - now.getTime()) / 60000;

            // Logica Senior-Centric de Tolerancia (Igual a tu Dashboard)
            if (diffMin < -30) {
              virtualStatus = 'NO_TOMADO'; // Ya pasó hace más de 30 mins
            } else if (diffMin <= 30 && diffMin >= -30) {
              virtualStatus = 'TOMAR_AHORA'; // Está en la ventana actual
            }

            fullTimeline.push({
              id: `VIRTUAL-${med.id}-${currentTime}`, // ID temporal para Flutter
              medication_id: med.id,
              medication_nombre: med.nombre,
              medication_descripcion: med.descripcion || '',
              tiempo_tomado: new Date(currentTime),
              estado: virtualStatus, 
              frecuencias_horas: med.frecuencia_horas,
              is_virtual: true, // 🔥 Frontend sabrá que esto es proyectado
            });
          }
          // Avanzamos el reloj asumiendo que no lo tomó
          currentTime += freqMs;
        }
      }
    }

    // 4. Ordenar TODO el historial cronológicamente (las más recientes arriba)
    fullTimeline.sort((a, b) => b.tiempo_tomado.getTime() - a.tiempo_tomado.getTime());

    return fullTimeline;
  }
}
