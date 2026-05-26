// src/modules/prescriptions/prescriptions.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Prescription } from './domain/prescriptions.entity';
import { PrescriptionController } from './presentation/controllers/prescriptions.controller';
import { PrescriptionService } from './application/prescriptions.service';
import { PrescriptionRepositoryImpl } from './infrastructure/repositories/prescriptions.repository.impl';

// 👇 Importamos Patients (porque usamos su repository en el service)
import { PatientsModule } from '../patients/patients.module';
import { Patient } from '../patients/domain/patient.entity';
import { MediaService } from 'src/module/media/applications/media.service';
import { MediaModule } from 'src/module/media/media.module';
import { MedicationsModule } from 'src/module/medications/medications.module'; // Asegúrate de importar tu módulo de medicamentos si lo necesitas

import {RecetaCompletaService} from './application/receta-completa.service';

import { RecetaCompletaController } from './presentation/controllers/receta-completa.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prescription, Patient]),
    forwardRef(() => PatientsModule), // 👈 importante por dependencia
    MediaModule, // 👈 para usar MediaService
    forwardRef(() => MedicationsModule), // 👈 si tu service de recetas necesita acceder a medicamentos
  ],
  controllers: [PrescriptionController, RecetaCompletaController],
  providers: [
    PrescriptionService,
    RecetaCompletaService,
    {
      provide: 'IPrescriptionRepository',
      useClass: PrescriptionRepositoryImpl,
    },
  ],
  exports: ['IPrescriptionRepository', PrescriptionService, RecetaCompletaService],
})
export class PrescriptionsModule {}
