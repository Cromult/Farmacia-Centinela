// src/modules/prescriptions/application/prescriptions.service.ts

import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import type { IPrescriptionRepository } from '../domain/prescriptions.repository.interface';
import type { IPatientRepository } from '../../patients/domain/patient.repository.interface';
import { PATIENT_REPOSITORY } from '../../patients/domain/patient.repository.interface';
import { Prescription } from '../domain/prescriptions.entity';
import { CreatePrescriptionDto } from '../presentation/dtos/create-prescriptions.dto';
import { UpdatePrescriptionDto } from '../presentation/dtos/update-prescriptions.dto';

import { PaginationResult } from 'src/utils/types/pagination-result.interface';
import { MediaService } from 'src/module/media/applications/media.service';

@Injectable()
export class PrescriptionService {
  constructor(
    @Inject('IPrescriptionRepository')
    private readonly repository: IPrescriptionRepository,

    @Inject(PATIENT_REPOSITORY) // ✅ correcto
    private readonly patientRepository: IPatientRepository,
    private readonly media: MediaService,
  ) {}

  async findAll(): Promise<Prescription[]> {
    return this.repository.findAll();
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Prescription>> {
    return this.repository.findAllPaginated(page, limit);
  }

  async findById(id: string): Promise<Prescription> {
    const prescription = await this.repository.findById(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }
  async findAllByUserId(userId: string): Promise<Prescription[]> {
    return this.repository.findAllByUserId(userId);
  }

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    // ✅ 1. Validar que el paciente existe
    const patient = await this.patientRepository.findOne(dto.patient_id);

    if (!patient) {
      throw new UnprocessableEntityException(
        `patient_id (${dto.patient_id}) no existe en patients`,
      );
    }

    // ✅ 2. Validación lógica de fechas
    if (dto.fecha_fin_receta < dto.fecha_inicio_receta) {
      throw new UnprocessableEntityException(
        'La fecha_fin_receta no puede ser menor que fecha_inicio_receta',
      );
    }

    // ✅ 3. Crear entidad con relación
    const prescription = new Prescription({
      patient: patient, // 👈 importante (relación real)
      instrucciones_globales: dto.instrucciones_globales,
      fecha_inicio_receta: dto.fecha_inicio_receta,
      fecha_fin_receta: dto.fecha_fin_receta,
    });

    return this.repository.create(prescription);
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    await this.findById(id);

    // ✅ Validación de fechas
    if (
      dto.fecha_inicio_receta &&
      dto.fecha_fin_receta &&
      dto.fecha_fin_receta < dto.fecha_inicio_receta
    ) {
      throw new UnprocessableEntityException(
        'La fecha_fin_receta no puede ser menor que fecha_inicio_receta',
      );
    }

    // ✅ SOLO CAMPOS EDITABLES
    const updateData: Partial<Prescription> = {
      instrucciones_globales: dto.instrucciones_globales,
      fecha_inicio_receta: dto.fecha_inicio_receta,
      fecha_fin_receta: dto.fecha_fin_receta,
    };

    return this.repository.update(id, updateData);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id); // valida existencia
    await this.repository.softDelete(id);
  }

  //Metodo de dashboard
  async getDashboardByUserId(userId: string): Promise<any> {
    const [prescription, patient] = await Promise.all([
      this.repository.getDashboardByUserId(userId),
      this.repository.getPatientByUserId(userId),
    ]);

    const patientName = `${patient?.profile?.name ?? ''} ${patient?.profile?.lastname ?? ''}`.trim();

    if (!prescription) {
      return {
        patient_name: patientName,
        prescription_id: null,
        total_medications: 0,
        next_medication: null,
        medications: [],
      };
    }

    const now = new Date();
    const meds = (prescription.medications || []).filter((m) => !m.deleted_at);

    let nextMedication: any = null;
    let nearestDate: Date | null = null;
    const medications: any[] = [];

    for (const med of meds) {
      const freqMs = med.frecuencia_horas * 60 * 60 * 1000;
      
      let baseDate: Date;
      let isAlreadyTaken = false;

      // 1. DETERMINAR LA BASE DE TIEMPO
      if (med.notifications && med.notifications.length > 0) {
        // Tiene historial: Usamos la última vez que el usuario interactuó
        const lastNotif = med.notifications[0];
        baseDate = new Date(lastNotif.tiempo_tomado || lastNotif.created_at);
        isAlreadyTaken = true;
      } else {
        // 🔥 CORRECCIÓN APLICADA AQUÍ: 
        // Usamos el 'created_at' INDIVIDUAL del medicamento, no el de la receta.
        // Esto permite que las actualizaciones SQL funcionen y separen las horas.
        baseDate = new Date(med.created_at);
      }

      let nextTake = new Date(baseDate);

      // 2. CALCULAR LA PRÓXIMA TOMA
      // Si ya se tomó antes, la próxima toma es la base + frecuencia
      if (isAlreadyTaken) {
        nextTake = new Date(nextTake.getTime() + freqMs);
      }

      // 3. AVANCE RÁPIDO (Fast-Forward) DE TOMAS PERDIDAS MÚLTIPLES
      // Si la toma calculada ya pasó Y el tiempo hasta su SIGUIENTE dosis también pasó,
      // avanzamos el reloj hasta encontrar la dosis actual pendiente.
      while (nextTake.getTime() + freqMs <= now.getTime()) {
        nextTake = new Date(nextTake.getTime() + freqMs);
      }

      // 4. LÓGICA DE IMÁGENES (Sin cambios, está perfecta)
      let imageUrl: string | null = null;
      if (med.medications_docs?.length) {
        const firstDoc = med.medications_docs[0];
        if (firstDoc.media_id) {
          try {
            imageUrl = await this.media.getPresignedUrl(firstDoc.media_id, 3600);
          } catch {
            imageUrl = null;
          }
        }
      }

      // Añadir a la lista general
      medications.push({
        id: med.id,
        nombre: med.nombre,
        dosis: med.dosis,
        frecuencia_horas: med.frecuencia_horas,
        next_take_at: nextTake,
        image_url: imageUrl,
      });

      // 5. SEMÁFORO Y PRIORIDAD (El medicamento principal)
      if (!nearestDate || nextTake < nearestDate) {
        nearestDate = nextTake;

        const diffMin = Math.floor((nextTake.getTime() - now.getTime()) / 60000);
        let status = 'PENDIENTE';
        const minutosTolerancia = 5;

        // Ampliamos el margen a 30 mins para que diga "TOMAR_AHORA"
        if (diffMin <= 30 && diffMin >= -minutosTolerancia) {
          status = 'TOMAR_AHORA';
        } else if (diffMin < -minutosTolerancia) {
          status = 'ATRASADO';
        }
        nextMedication = {
          id: med.id,
          nombre: med.nombre,
          dosis: med.dosis,
          frecuencia_horas: med.frecuencia_horas,
          next_take_at: nextTake,
          status,
          image_url: imageUrl,
        };
      }
    }

    return {
      patient_name: patientName,
      prescription_id: prescription.id,
      total_medications: meds.length,
      next_medication: nextMedication,
      medications,
    };
  }

  async getPrescriptionHistory(prescriptionId: string): Promise<any> {
    const prescription = await this.repository.getPrescriptionWithHistory(prescriptionId);

    if (!prescription) {
      throw new NotFoundException(`La receta con ID ${prescriptionId} no existe.`);
    }

    // Filtramos medicamentos activos
    const meds = (prescription.medications || []).filter((m) => !m.deleted_at);

    // Formateamos la respuesta para el Frontend
    return {
      prescription_id: prescription.id,
      instrucciones: prescription.instrucciones_globales,
      fecha_inicio: prescription.fecha_inicio_receta,
      fecha_fin: prescription.fecha_fin_receta,
      total_medications: meds.length,
      
      // Lista de medicamentos con su historial de tomas
      medications: meds.map((med) => ({
        medication_id: med.id,
        nombre: med.nombre,
        dosis: med.dosis,
        frecuencia_horas: med.frecuencia_horas,
        total_tomas_registradas: med.notifications?.length || 0,
        
        // El historial exacto de este medicamento
        historial_tomas: (med.notifications || []).map((notif) => ({
          notification_id: notif.id,
          estado: notif.estado, // TIEMPO, DESTIEMPO, NO_TOMADO
          tiempo_tomado: notif.tiempo_tomado,
          registrado_el: notif.created_at,
        })),
      })),
    };
  }
}
