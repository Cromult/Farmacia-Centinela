// src/module/prescriptions/domain/prescriptions.repository.interface.ts

import { Prescription } from './prescriptions.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

export interface IPrescriptionRepository {
  create(prescription: Prescription): Promise<Prescription>;

  findAll(): Promise<Prescription[]>;

  // ✅ listado paginado
  findAllPaginated(
    page?: number,
    limit?: number,
  ): Promise<PaginationResult<Prescription>>;

  findById(id: string): Promise<Prescription | null>;

  update(
    id: string,
    prescription: Partial<Prescription>,
  ): Promise<Prescription>;

  softDelete(id: string): Promise<void>;
  getDashboardByUserId(userId: string): Promise<any>;
  getPatientByUserId(userId: string): Promise<any>;
  findAllByUserId(userId: string): Promise<Prescription[]>;
  // NUEVO: Método para obtener el historial de tomas
  getPrescriptionWithHistory(prescriptionId: string): Promise<any>;
}
