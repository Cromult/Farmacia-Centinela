// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

import authConfig from './config/auth.config';
import { UsersModule } from './module/users/users.module';
import { AuthModule } from './module/auth/auth.module';
import s3Config from './config/s3.config';
import appConfig from './config/app.config';
import { ProfilesModule } from './module/profiles/profiles.module';
import { MediaModule } from './module/media/media.module';
import { PatientsModule } from './module/patients/patients.module';
import { PrescriptionsModule } from './module/prescriptions/prescriptions.module';
import {MedicationsModule} from './module/medications/medications.module';
import {MedicationsDocModule} from './module/medications-doc/medications-doc.module';
import {MedicantionNotificationModule} from 'src/module/medicantion-notification/medicantion-notification.module';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, s3Config, appConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        const dbType = configService.get<string>('DB_TYPE');

        if (!dbType || !['mysql', 'postgres'].includes(dbType)) {
          throw new Error('DB_TYPE must be either mysql or postgres');
        }

        const common = {
          autoLoadEntities: true,
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true), // ✅ corregido
          logging: (configService.get('DB_LOGGING', 'true') === 'true' 
            ? ['query', 'error', 'warn']
            : false) as any,
        };

        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            ...common,
          };
        }

        // ✅ POSTGRES
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          ssl:
            configService.get<string>('DB_SSL_MODE', 'false') === 'true'
              ? { rejectUnauthorized: false }
              : false,
          ...common,
        };
      },
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST', 'sandbox.smtp.mailtrap.io'),
          port: config.get<number>('MAIL_PORT', 2525),
          auth: {
            // AQUÍ VA EL "USER" Y EL "PASS" DE TU CAPTURA DE MAILTRAP
            user: config.get('MAIL_USER'), 
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"Farmacia Centinela" <no-reply@farmaciacentinela.com>',
        },
      }),
    }),

    UsersModule,
    AuthModule,
    ProfilesModule,
    MediaModule,
    PatientsModule,
    PrescriptionsModule,
    MedicationsModule,
    MedicationsDocModule,
    MedicantionNotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
