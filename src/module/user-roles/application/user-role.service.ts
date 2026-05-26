import { Inject, Injectable } from '@nestjs/common';
import type { IUserRoleRepository } from '../domain/user-role.repository.interface';
import { UserRole } from '../domain/user-role.entity';
import { CreateUserRoleDto } from '../presentation/dtos/create-user-role.dto';

@Injectable()
export class UserRoleService {
  constructor(@Inject('IUserRoleRepository') private readonly repository: IUserRoleRepository) {}

  async findRoleNamesByUserId(userId: number | string): Promise<string[]> {
    const roles = await this.repository.findRolesByUserId(userId);
    if (roles.length === 0) return ['user']; 
    return roles.map(r => r.role_name);
  }

  async create(dto: CreateUserRoleDto): Promise<UserRole> {
    const entity = new UserRole(dto);
    return this.repository.create(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
