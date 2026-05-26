import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Patient } from './domain/patient.entity';
import { PatientController } from './presentation/patient.controller';
import { PatientService } from './application/patient.service';

import { PATIENT_REPOSITORY } from './domain/patient.repository.interface';
import { PatientRepositoryImpl } from './infrastructure/repositories/patient.repository.impl';
import { MediaModule } from '../media/media.module';
import { User } from '../users/domain/user.entity';
import { Profile } from '../profiles/domain/profile.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import { HashingModule } from '../hashing/hashing.module';
import { PatientOrchestratorService } from './application/patient-orchestrator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, User, Profile]),
    ProfilesModule,
    UsersModule,
    MediaModule,
    HashingModule,
  ],
  controllers: [PatientController],
  providers: [
    PatientService,
    PatientOrchestratorService,
    { provide: PATIENT_REPOSITORY, useClass: PatientRepositoryImpl },
  ],
  exports: [PatientService, PATIENT_REPOSITORY, PatientOrchestratorService],
})
export class PatientsModule {}
