// src/module/users/application/user.service.ts
import { Inject, Injectable, NotFoundException, BadGatewayException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../presentation/dtos/create-user.dto';
import { UpdateUserDto } from '../presentation/dtos/update-user.dto';
import { GetUserDto } from '../presentation/dtos/get-user.dto';
import * as passwordHasherInterface from '../../hashing/domain/password-hasher.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
    @Inject(passwordHasherInterface.PASSWORD_HASHER)
    private readonly hasher: passwordHasherInterface.PasswordHasher,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repository.findAll();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<GetUserDto> {
    const hashedPassword = await this.hasher.hash(dto.password);
    const entity = new User({
      email: dto.email,
      password: hashedPassword,
      is_active: dto.is_active ?? true,
    });
    const saved = await this.repository.create(entity);
    return GetUserDto.fromEntity(saved);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.softDelete(id);
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.repository.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validPassword = await this.hasher.compare(oldPassword, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // ✅ La nueva contraseña no puede ser igual a la actual
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedNewPassword = await this.hasher.hash(newPassword);

    await this.repository.updatePassword(userId, hashedNewPassword);

    return {
      message: 'Password updated successfully',
    };
  }

  async updateResetCode(userId: string, code: string, expires: Date): Promise<void> {
    await this.repository.updateResetCode(userId, code, expires);
  }

  async clearResetCode(userId: string): Promise<void> {
    await this.repository.clearResetCode(userId);
  }

  // Añadimos este para el flujo de "olvidé mi contraseña" 
  // (a diferencia de updatePassword, este no pide la clave vieja)
  async resetPassword(userId: string, hashedPass: string): Promise<void> {
    await this.repository.updatePasswordDirectly(userId, hashedPass);
  }
}
