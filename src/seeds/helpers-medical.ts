// src/seeds/helpers-medical.ts
import { DataSource } from 'typeorm';
import { User } from 'src/module/users/domain/user.entity';
import { Profile } from 'src/module/profiles/domain/profile.entity';
import { Patient } from 'src/module/patients/domain/patient.entity';
import { UserRole } from 'src/module/user-roles/domain/user-role.entity';
import { Prescription } from 'src/module/prescriptions/domain/prescriptions.entity';
import { Medication } from 'src/module/medications/domain/medications.entity';
import { PasswordHasher } from 'src/module/hashing/domain/password-hasher.interface';

export async function ensureUserWithProfile(
  ds: DataSource,
  hasher: PasswordHasher,
  data: { id?: string; email: string; password: string; profile: any }
) {
  const userRepo = ds.getRepository(User);
  const profileRepo = ds.getRepository(Profile);

  let user = await userRepo.findOne({ where: { email: data.email } });
  if (!user) {
    const hashedPassword = await hasher.hash(data.password);
    user = userRepo.create({
      id: data.id,
      email: data.email,
      password: hashedPassword,
    });
    user = await userRepo.save(user);

    const profile = profileRepo.create({
      ...data.profile,
      user_id: user.id, // Shared PK
    });
    await profileRepo.save(profile);
  }
  return user;
}

export async function ensureRole(ds: DataSource, userId: string, roleName: string) {
  const roleRepo = ds.getRepository(UserRole);
  let userRole = await roleRepo.findOne({ where: { user_id: userId, role_name: roleName } });
  if (!userRole) {
    userRole = roleRepo.create({ user_id: userId, role_name: roleName });
    await roleRepo.save(userRole);
  }
  return userRole;
}

export async function ensurePatient(ds: DataSource, userId: string, hospital?: string) {
  const patientRepo = ds.getRepository(Patient);
  let patient = await patientRepo.findOne({ where: { user_id: userId } });
  if (!patient) {
    patient = patientRepo.create({
      user_id: userId,
      hospital,
    });
    await patientRepo.save(patient);
  }
  return patient;
}

export async function ensurePrescription(ds: DataSource, patientId: string, pData: any): Promise<Prescription> {
  const repo = ds.getRepository(Prescription);
  let prescription = await repo.findOne({ where: { id: pData.id } });
  if (!prescription) {
    const newPrescription = repo.create({
      ...pData,
      patient: { user_id: patientId } as any,
    });
    const saved = await repo.save(newPrescription);
    prescription = Array.isArray(saved) ? saved[0] : saved;
  }
  return prescription;
}

export async function ensureMedication(ds: DataSource, prescriptionId: string, mData: any): Promise<Medication> {
  const repo = ds.getRepository(Medication);
  let med = await repo.findOne({ where: { id: mData.id } });
  if (!med) {
    const newMed = repo.create({
      ...mData,
      prescription_id: prescriptionId,
    });
    const saved = await repo.save(newMed);
    med = Array.isArray(saved) ? saved[0] : saved;
  }
  return med;
}