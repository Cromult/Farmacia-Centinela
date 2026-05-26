// src/module/users/infrastructure/repositories/user.repository.impl.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../../domain/user.repository.interface';
import { User } from '../../domain/user.entity';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async create(data: User): Promise<User> {
    return await this.repo.save(data);
  }
  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }
  // @ts-ignore : TypeScript workaround for generic ID types in TypeORM
  async findById(id: string): Promise<User | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async findOne(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['profile', 'userRoles'],
      withDeleted: false,
    });
  }
  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repo.update(id, data);
    return (await this.findById(id)) as User;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  //Metodo para actualizar password
  async updatePassword(id: string, password: string): Promise<User> {
    const existing = await this.repo.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    existing.password = password;
    return this.repo.save(existing);
  }

  async updateResetCode(id: string, code: string, expires: Date): Promise<void> {
    await this.repo.update(id, {
      reset_code: code,
      reset_code_expires: expires,
    });
  }

  async clearResetCode(id: string): Promise<void> {
    await this.repo.update(id, {
      reset_code: null,
      reset_code_expires: null,
    });
  }

  async updatePasswordDirectly(id: string, hashedPass: string): Promise<void> {
    await this.repo.update(id, {
      password: hashedPass,
    });
  }
}
