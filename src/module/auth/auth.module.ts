import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtInfraModule } from './infrastructure/jwt.config';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtAccessStrategy } from './infrastructure/strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

import { UsersModule } from '../users/users.module';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { HashingModule } from '../hashing/hashing.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    ConfigModule,
    JwtInfraModule,
    UsersModule,
    UserRolesModule,
    HashingModule,
    ProfilesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, JwtAccessStrategy, JwtRefreshStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
