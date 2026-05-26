import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../../application/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { JwtRefreshGuard } from '../../infrastructure/guards/jwt-refresh.guard';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { setAuthCookies, clearAuthCookies } from '../../infrastructure/cookies';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos/forgot-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieFlags() {
    const secure = this.config.get('COOKIE_SECURE') === 'true';
    const sameSite = this.config.get('COOKIE_SAMESITE') ?? 'lax';
    return { secure, sameSite };
  }
  
  private cookieAges() {
    return {
      accessMs: this.config.get<number>('auth.accessCookieMs') || 120000,
      refreshMs: this.config.get<number>('auth.refreshCookieMs') || 300000,
    };
  }

  // =========================
  // LOGIN
  // =========================
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login con email y password' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el usuario autenticado y setea cookies con tokens JWT',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.auth.login(dto.email, dto.password);
    const flags = this.cookieFlags();
    const ages = this.cookieAges();
    setAuthCookies(res, tokens, { ...flags, ...ages });
    return { user: user, access_token: tokens.access };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar código de recuperación por email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña usando el código recibido' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  // =========================
  // ME (requiere JWT válido)
  // =========================
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve los datos del usuario actual',
  })
  me(@Req() req: Request & { user?: any }) {
    const { sub, email, roles } = (req.user as any) ?? {};
    return { user: { id: sub, email, roles } };
  }

  // =========================
  // REFRESH
  // =========================
  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Refrescar tokens usando refresh_token' })
  @ApiResponse({
    status: 200,
    description: 'Genera nuevos tokens y actualiza cookies',
  })
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request & { user?: any },
  ) {
    const { sub } = req.user as any;
    const tokens = await this.auth.refresh(sub);
    const flags = this.cookieFlags();
    const ages = this.cookieAges();
    setAuthCookies(res, tokens, { ...flags, ...ages });
    return { ok: true };
  }

  // =========================
  // LOGOUT
  // =========================
  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cerrar sesión (limpia cookies de autenticación)' })
  @ApiResponse({
    status: 200,
    description: 'Confirma logout',
  })
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { ok: true };
  }
}
