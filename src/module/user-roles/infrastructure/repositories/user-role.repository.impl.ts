import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRoleRepository } from '../../domain/user-role.repository.interface';
import { UserRole } from '../../domain/user-role.entity';

@Injectable()
export class UserRoleRepositoryImpl implements IUserRoleRepository {
  constructor(@InjectRepository(UserRole) private readonly repo: Repository<UserRole>) {}

  async create(data: UserRole): Promise<UserRole> { return await this.repo.save(data); }
  
  async findRolesByUserId(userId: number | string): Promise<UserRole[]> {
    return await this.repo.find({ where: { user_id: userId as any } });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
