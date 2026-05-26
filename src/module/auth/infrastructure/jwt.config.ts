import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
@Module({ imports: [ JwtModule.register({}), ConfigModule ], exports: [JwtModule] })
export class JwtInfraModule {}
