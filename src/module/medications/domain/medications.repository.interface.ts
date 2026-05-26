// src/modules/medications/domain/medications.repository.interface.ts

import { Medication } from './medications.entity';
import { MedicationsDoc } from '../../medications-doc/domain/medications-doc.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

export interface IMedicationRepository {
  // -------------------------
  // CRUD base
  // -------------------------
  create(medication: Medication): Promise<Medication>;
  findAll(): Promise<Medication[]>;
  findAllPaginated(page?: number, limit?: number): Promise<PaginationResult<Medication>>;
  findById(id: string): Promise<Medication | null>;
  update(id: string, payload: Partial<Medication>): Promise<Medication>;
  softDelete(id: string): Promise<void>;

  // -------------------------
  // Búsquedas por relaciones
  // -------------------------
  /** Obtener todos los medications de una prescription */
  findByPrescriptionId(prescriptionId: string): Promise<Medication[]>;

  /** Obtener medications de una prescription con paginación */
  findByPrescriptionIdPaginated(
    prescriptionId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginationResult<Medication>>;

  /** Buscar un medication específico dentro de una prescription */
  findByIdAndPrescription(
    medicationId: string,
    prescriptionId: string,
  ): Promise<Medication | null>;

  // -------------------------
  // Relaciones con MedicationsDoc (media)
  // -------------------------
  addDocToMedication(
    medicationId: string,
    medicationDoc: MedicationsDoc,
  ): Promise<MedicationsDoc>;

  removeDocFromMedication(
    medicationId: string,
    medicationDocId: string,
  ): Promise<void>;

  findDocsByMedication(medicationId: string): Promise<MedicationsDoc[]>;

  findDocById(docId: string): Promise<MedicationsDoc | null>;

  // -------------------------
  // Operaciones utilitarias / conteos
  // -------------------------
  countByPrescriptionId(prescriptionId: string): Promise<number>;

  /** Obtener medications por múltiples prescriptions (útil para dashboards) */
  findAllByPrescriptionIds(prescriptionIds: string[]): Promise<Medication[]>;

  /** Versión ligera (para performance, listas, etc.) */
  findLightweightByPrescriptionIds(
    prescriptionIds: string[],
  ): Promise<
    {
      prescription_id: string;
      id: string;
      nombre: string;
      descripcion: string;
      dosis: string;
      cantidad: number;
      frecuencia_horas: number;
      duracion_dias: number;
      via_administracion: string;
      updated_at: Date;
    }[]
  >;

  /** Obtener detalle completo (con relaciones si necesitas) */
  findDetailById(medicationId: string): Promise<Medication | null>;

  findMyLatestPrescriptionMedicationsPaginated(params: {
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginationResult<Medication>>;
}
