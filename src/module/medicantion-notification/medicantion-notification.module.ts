// src/modules/medicantion-notification/medicantion-notification.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Entity
import { MedicantionNotification } from './domain/medicantion-notification.entity';
import { Medication } from '../medications/domain/medications.entity';

// Controller
import { MedicantionNotificationController } from './presentation/controller/medicantion-notification.controller';

// Service
import { MedicantionNotificationService } from './application/services/medicantion-notification.service';

// Repository
import { MedicantionNotificationRepositoryImpl } from './infrastructure/repositories/medicantion-notification.repository.impl';

import { MedicationsModule } from 'src/module/medications/medications.module';
import { MediaModule } from 'src/module/media/media.module';
import {MedicantionNotificationService as MedicantionNotificationServiceMedia} from './application/services/medicantion-notification-media.service';

import {PrescriptionsModule} from '../prescriptions/prescriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicantionNotification,
      Medication, // necesario para relaciones
      // para evitar dependencias circulares
    ]),
    HttpModule, // Necesario para HttpService
    forwardRef(() => MedicationsModule),
    forwardRef(() => MediaModule),
    forwardRef(() => PrescriptionsModule),
  ],

  controllers: [MedicantionNotificationController],

  providers: [
    {
      provide: 'IMedicantionNotificationRepository',
      useClass: MedicantionNotificationRepositoryImpl,
    },

    MedicantionNotificationService,
    MedicantionNotificationServiceMedia,
  ],

  exports: [
    TypeOrmModule,
    'IMedicantionNotificationRepository',
    MedicantionNotificationService,
  ],
})
export class MedicantionNotificationModule {}