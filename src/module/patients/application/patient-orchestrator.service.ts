// src/module/patients/application/patient-orchestrator.service.ts

import {
  Injectable,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { User } from 'src/module/users/domain/user.entity';
import { Profile } from 'src/module/profiles/domain/profile.entity';
import { Patient } from '../domain/patient.entity';

import {
  USER_REPOSITORY,
  type IUserRepository,
} from 'src/module/users/domain/user.repository.interface';

import * as patientRepositoryInterface from '../domain/patient.repository.interface';
import { PROFILE_REPOSITORY, type IProfileRepository } from 'src/module/profiles/domain/profile.repository.interface';

import { CreatePatientUserProfileDto } from '../presentation/dtos/create-patient-user-profile.dto';

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from 'src/module/hashing/domain/password-hasher.interface';

@Injectable()
export class PatientOrchestratorService {
  constructor(
    private readonly dataSource: DataSource,

    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,

    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: IProfileRepository,

    @Inject(patientRepositoryInterface.PATIENT_REPOSITORY)
    private readonly patientRepo: patientRepositoryInterface.IPatientRepository,

    @Inject(PASSWORD_HASHER)
    private readonly hasher: PasswordHasher,
  ) {}

  async createFull(dto: CreatePatientUserProfileDto) {
    // 🚨 VALIDACIÓN PREVIA (fuera de transacción = más eficiente)
    const existingUser = await this.userRepo.findByEmail(dto.user.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // =========================================
      // 1. USER (CON HASH)
      // =========================================
      const hashedPassword = await this.hasher.hash(dto.user.password);

      const user = new User({
        email: dto.user.email,
        password: hashedPassword,
        is_active: dto.user.is_active ?? true,
      });

      const savedUser = await queryRunner.manager.save(User, user);

      const userId = savedUser.id;

      // =========================================
      // 2. PROFILE
      // =========================================
      const profile = new Profile();
      Object.assign(profile, {
        ...dto.profile,
        user_id: userId,
      });

      const savedProfile = await queryRunner.manager.save(Profile, profile);

      // =========================================
      // 3. PATIENT (OPCIONAL)
      // =========================================
      let savedPatient: Patient | null = null;

      if (dto.patient) {
        const patient = new Patient();
        Object.assign(patient, {
          ...dto.patient,
          user_id: userId,
        });

        savedPatient = await queryRunner.manager.save(Patient, patient);
      }

      // =========================================
      // ✅ COMMIT
      // =========================================
      await queryRunner.commitTransaction();

      return {
        user: savedUser,
        profile: savedProfile,
        patient: savedPatient,
      };
    } catch (error) {
      // ❌ ROLLBACK REAL
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
