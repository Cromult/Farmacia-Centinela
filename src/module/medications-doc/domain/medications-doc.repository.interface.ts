// src/modules/medications-doc/domain/medications-doc.repository.interface.ts
import { MedicationsDoc } from './medications-doc.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

export interface IMedicationsDocRepository {
  create(doc: MedicationsDoc): Promise<MedicationsDoc>;

  /** ✅ listado simple (sin paginación) */
  findAll(): Promise<MedicationsDoc[]>;

  /** ✅ listado paginado (cuando el cliente envía page/limit) */
  findAllPaginated(
    page?: number,
    limit?: number,
  ): Promise<PaginationResult<MedicationsDoc>>;

  findById(id: string): Promise<MedicationsDoc | null>;

  // /** ✅ listado filtrado por submission_id */
  // findBySubmissionId(submissionId: string): Promise<MedicationsDoc[]>;

  update(id: string, doc: Partial<MedicationsDoc>): Promise<MedicationsDoc>;

  softDelete(id: string): Promise<void>;
}
