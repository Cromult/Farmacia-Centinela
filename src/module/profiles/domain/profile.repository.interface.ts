// src/modules/profiles/domain/profile.repository.interface.ts
import { Profile } from './profile.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

export interface IProfileRepository {
  save(entity: Profile): Promise<Profile>;
  findAll(): Promise<Profile[]>;
  findAllPaginated(
    page?: number,
    limit?: number,
  ): Promise<PaginationResult<Profile>>;
  findOne(user_id: string): Promise<Profile | null>;
  update(user_id: string, partial: Partial<Profile>): Promise<Profile>;
  softDelete(user_id: string): Promise<void>;
  findOneWithDetails(user_id: string): Promise<Profile | null>;
  updateProfilePicture(userId: string, mediaId: string | null): Promise<Profile>;
}

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');
