import { UserRole } from './user-role.entity';

export interface IUserRoleRepository {
  create(data: UserRole): Promise<UserRole>;
  findRolesByUserId(userId: number | string): Promise<UserRole[]>;
  delete(id: number): Promise<void>;
}
