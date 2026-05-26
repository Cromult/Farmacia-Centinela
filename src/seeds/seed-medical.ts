// src/seeds/seed-medical.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { PASSWORD_HASHER, PasswordHasher } from 'src/module/hashing/domain/password-hasher.interface';
import { SEED_ADMIN, SEED_PATIENTS, SEED_ROLES } from './constants-medical';
import { ensureUserWithProfile, ensureRole, ensurePatient, ensurePrescription, ensureMedication } from './helpers-medical';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const ds = app.get(DataSource);
    const hasher = app.get<PasswordHasher>(PASSWORD_HASHER);

    console.log('🚀 Iniciando Seed Médico (Sin Media)...');

    // 1. Roles
    for (const r of SEED_ROLES) {
      // Nota: El helper de rol que definimos usa user_id, 
      // pero si tienes una tabla maestra de Roles podrías crearla primero aquí.
    }

    // 2. Admin
    const adminUser = await ensureUserWithProfile(ds, hasher, SEED_ADMIN);
    await ensureRole(ds, adminUser.id, 'admin');
    console.log('✅ Admin Creado');

    // 3. Pacientes y Recetas
    for (const p of SEED_PATIENTS) {
      const user = await ensureUserWithProfile(ds, hasher, {
        id: p.user.id,
        email: p.user.email,
        password: p.user.password,
        profile: p.profile,
      });

      await ensureRole(ds, user.id, 'patient');
      const patient = await ensurePatient(ds, user.id, p.patientData.hospital);
      console.log(`👤 Paciente: ${p.profile.name}`);

      for (const presc of p.prescriptions) {
        const dbPresc = await ensurePrescription(ds, patient.user_id, {
          id: presc.id,
          instrucciones_globales: presc.instrucciones_globales,
          fecha_inicio_receta: presc.fecha_inicio_receta,
          fecha_fin_receta: presc.fecha_fin_receta,
        });

        for (const med of presc.medications) {
          await ensureMedication(ds, dbPresc.id, med);
        }
      }
    }

    console.log('🎉 Seed finalizado con éxito.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

run();