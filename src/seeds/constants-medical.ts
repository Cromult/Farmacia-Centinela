// src/seeds/constants-medical.ts

export const SEED_ROLES = [
  { name: 'admin', description: 'Administrador del Sistema' },
  { name: 'doctor', description: 'Personal Médico' },
  { name: 'patient', description: 'Paciente' },
] as const;

export const SEED_ADMIN = {
  id: 'USER-ADM-001',
  email: 'admin@salud.local',
  password: 'AdminPassword2026!',
  profile: {
    name: 'Carlos',
    lastname: 'Pérez',
    ci: '1234567-LP',
    birthdate: '1985-10-20',
    birthplace: 'Sucre',
    nationality: 'Boliviana',
    gender: 'M',
    phone: '70012345',
  },
} as const;

export const SEED_PATIENTS = [
  {
    user: {
      id: 'USER-PAT-001',
      email: 'juan.perez@email.com',
      password: 'Patient123!',
    },
    profile: {
      name: 'Juan',
      lastname: 'Perez Miranda',
      ci: '8822334-SC',
      birthdate: '1995-05-12',
      birthplace: 'Santa Cruz',
      nationality: 'Boliviana',
      gender: 'M',
      phone: '71098765',
    },
    patientData: {
      hospital: 'Hospital Santa Barbara',
    },
    prescriptions: [
      {
        id: 'PRSC-000001',
        instrucciones_globales: 'Tomar con abundante agua.',
        fecha_inicio_receta: new Date('2026-03-20'),
        fecha_fin_receta: new Date('2026-04-20'),
        medications: [
          {
            id: 'MED-000001',
            nombre: 'Paracetamol',
            dosis: '500mg',
            frecuencia_horas: 8,
          },
          {
            id: 'MED-000002',
            nombre: 'Ibuprofeno',
            dosis: '400mg',
            frecuencia_horas: 12,
          }
        ]
      }
    ]
  }
] as const;