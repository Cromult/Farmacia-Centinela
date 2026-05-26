// src/modules/medications/medications.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Entities
import { Medication } from './domain/medications.entity';
import { MedicationsDoc } from '../medications-doc/domain/medications-doc.entity';
import { Prescription } from '../prescriptions/domain/prescriptions.entity';
import { Media } from '../media/domain/media.entity';

// Modules
import { MediaModule } from '../media/media.module';
import { AuthModule } from '../auth/auth.module';
import { MedicationsDocModule } from '../medications-doc/medications-doc.module';

// Controller
import { MedicationsController } from './presentation/controller/medications.controller';

// Service
import { MedicationService } from './application/services/medications.service';

// Repository
import { MedicationRepositoryImpl } from './infrastructure/repositories/medications.repository.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Medication,
      MedicationsDoc,
      Prescription,
      Media, // necesario para media relations
    ]),
    HttpModule, // necesario para HttpService
    forwardRef(() => MediaModule),
    forwardRef(() => AuthModule),
    forwardRef(() => MedicationsDocModule),
  ],

  controllers: [MedicationsController],

  providers: [
    {
      provide: 'IMedicationRepository',
      useClass: MedicationRepositoryImpl,
    },

    MedicationService,
  ],

  exports: [
    TypeOrmModule,
    'IMedicationRepository',
    MedicationService,
  ],
})
export class MedicationsModule {}