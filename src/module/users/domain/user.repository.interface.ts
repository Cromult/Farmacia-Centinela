import { User } from './user.entity';

export interface IUserRepository {
  create(data: User): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  softDelete(id: string): Promise<void>;
  updatePassword(id: string, password: string): Promise<User>;
  findOne(id: string): Promise<User | null>;
  updateResetCode(id: string, code: string, expires: Date): Promise<void>;
  clearResetCode(id: string): Promise<void>;
  updatePasswordDirectly(id: string, hashedPass: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
