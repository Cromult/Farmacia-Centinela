// src/module/auth/application/auth.service.ts
import { Inject, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/application/user.service';
import { UserRoleService } from '../../user-roles/application/user-role.service';
import * as passwordHasherInterface from '../../hashing/domain/password-hasher.interface';
import { AccessPayload, RefreshPayload, TokenPair } from '../domain/auth.types';
import { ResetPasswordDto } from '../presentation/dtos/forgot-password.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly userRoles: UserRoleService,
    @Inject(passwordHasherInterface.PASSWORD_HASHER) private readonly hasher: passwordHasherInterface.PasswordHasher,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  private signAccess(payload: AccessPayload): string {
    return this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('auth.accessTtl') as any || '120s',
    });
  }

  private signRefresh(payload: RefreshPayload): string {
    return this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('auth.refreshTtl') as any || '300s',
    });
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const ok = await this.hasher.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    
    const roles = await this.userRoles.findRoleNamesByUserId(user.id);
    const tokens = {
      access: this.signAccess({ sub: user.id, email: user.email, roles }),
      refresh: this.signRefresh({ sub: user.id, type: 'refresh' })
    };
    
    return { tokens, user: { id: user.id, email: user.email, roles } };
  }

  async refresh(sub: number | string) {
    const parsedSub = typeof sub === 'string' && !isNaN(Number(sub)) ? Number(sub) : sub;
    const user = await this.users.findById(parsedSub as any);
    
    if (!user) throw new UnauthorizedException('User not found');
    const roles = await this.userRoles.findRoleNamesByUserId(user.id);
    
    return {
      access: this.signAccess({ sub: user.id, email: user.email, roles }),
      refresh: this.signRefresh({ sub: user.id, type: 'refresh' })
    };
  }

  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new NotFoundException('Paciente no encontrado');

    // 1. Generar código de 6 dígitos (Senior-Friendly) 
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Expira rápido por seguridad

    // 2. Guardar en DB [cite: 968]
    await this.users.updateResetCode(user.id, code, expires);

    // 3. ¡Enviar el correo!
    await this.mailerService.sendMail({
      to: email,
      subject: 'Código de Recuperación - Farmacia Centinela',
      html: `
        <div style="font-family: 'Public Sans', sans-serif; padding: 20px;">
          <h1 style="color: #00327d;">Hola, ${user.email}</h1>
          <p style="font-size: 18px;">Tu código de recuperación es:</p>
          <div style="background: #f1f3ff; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px;">
            ${code}
          </div>
          <p>Este código vencerá en 15 minutos.</p>
        </div>
      `,
    });

    return { message: 'Código enviado con éxito' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.users.findByEmail(dto.email);
    
    // Validaciones de seguridad
    if (!user || user.reset_code !== dto.code) {
      throw new UnauthorizedException('Código o correo inválido');
    }

    if (!user.reset_code_expires || new Date() > user.reset_code_expires) {
      throw new UnauthorizedException('El código ha expirado');
    }

    // Hashear y actualizar
    const hashedNewPassword = await this.hasher.hash(dto.newPassword);
    await this.users.resetPassword(user.id, hashedNewPassword);
    
    // Limpiar el código usado
    await this.users.clearResetCode(user.id);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
