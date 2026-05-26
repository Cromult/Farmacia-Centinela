//src/module/patients/domain/patient.repository.interface.ts
import { Patient } from './patient.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

export interface IPatientRepository {
  save(entity: Patient): Promise<Patient>;
  findAll(): Promise<Patient[]>;
  findAllPaginated(
    page?: number,
    limit?: number,
  ): Promise<PaginationResult<Patient>>;
  findOne(user_id: string): Promise<Patient | null>;
  update(user_id: string, partial: Partial<Patient>): Promise<Patient>;
  softDelete(user_id: string): Promise<void>;
  // (opcional) restore(user_id: string): Promise<void>;
}

export const PATIENT_REPOSITORY = Symbol('PATIENT_REPOSITORY');
