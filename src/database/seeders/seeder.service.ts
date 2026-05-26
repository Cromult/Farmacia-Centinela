import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Importa tus entidades
import { User } from 'src/module/users/domain/user.entity';
import { Profile } from 'src/module/profiles/domain/profile.entity';
import { Patient } from 'src/module/patients/domain/patient.entity';
import { Prescription } from 'src/module/prescriptions/domain/prescriptions.entity';
import { Medication } from 'src/module/medications/domain/medications.entity';
import { 
  MedicantionNotification, 
  MedicationNotificationStatus 
} from 'src/module/medicantion-notification/domain/medicantion-notification.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Prescription) private prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Medication) private medicationRepo: Repository<Medication>,
    @InjectRepository(MedicantionNotification) private notificationRepo: Repository<MedicantionNotification>,
  ) {}

  async seed() {
    this.logger.log('Iniciando carga de datos semilla para Farmacia Centinela...');

    // Limpiar datos anteriores
    try {
      this.logger.log('Limpiando datos antiguos...');
      const seedEmails = [
        'pablo2@example.com',
        'jhamil@example.com',
        'antonio@example.com',
        'lujan@example.com',
        'vladi@example.com'
      ];
      for (const email of seedEmails) {
        const existingUser = await this.userRepo.findOne({ where: { email } });
        if (existingUser) {
          await this.userRepo.remove(existingUser);
        }
      }
      this.logger.log('Datos antiguos eliminados ✅');
    } catch (error) {
      this.logger.warn('No se pudieron limpiar datos antiguos:', error);
    }

    // Arreglo con la data base para iterar
    const seedData = [
      {
        email: 'pablo2@example.com',
        hospital: 'UNIVERSITARIO',
        instrucciones: 'Tomar 1 pastilla cada 8 horas después de las comidas',
        fechaInicio: new Date('2026-03-24'),
        fechaFin: new Date('2026-04-01'),
        meds: [{ nombre: 'Paracetamol', dosis: '500mg', freq: 8, estado: MedicationNotificationStatus.TIEMPO }]
      },
      {
        email: 'jhamil@example.com',
        hospital: 'SANTA BARBARA',
        instrucciones: 'Tomar en ayunas con abundante agua',
        fechaInicio: new Date('2026-04-10'),
        fechaFin: new Date('2026-04-20'),
        meds: [{ nombre: 'Omeprazol', dosis: '20mg', freq: 24, estado: MedicationNotificationStatus.NO_TOMADO }]
      },
      {
        email: 'antonio@example.com',
        hospital: 'GASTROENTEROLOGICO',
        instrucciones: 'Tomar junto con el almuerzo',
        fechaInicio: new Date('2026-04-12'),
        fechaFin: new Date('2026-04-19'),
        meds: [{ nombre: 'Amoxicilina', dosis: '500mg', freq: 12, estado: MedicationNotificationStatus.TIEMPO }]
      },
      {
        email: 'lujan@example.com',
        hospital: 'CRISTO DE LAS AMERICAS',
        instrucciones: 'Mantener un registro estricto de la presión arterial',
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-12-31'),
        meds: [{ nombre: 'Losartán', dosis: '50mg', freq: 24, estado: MedicationNotificationStatus.TIEMPO }]
      },
      {
        email: 'vladi@example.com',
        hospital: 'SAN PEDRO CLAVER',
        instrucciones: 'Tomar solo si hay dolor intenso',
        fechaInicio: new Date('2026-04-14'),
        fechaFin: new Date('2026-04-18'),
        meds: [{ nombre: 'Ibuprofeno', dosis: '400mg', freq: 8, estado: MedicationNotificationStatus.DESTIEMPO }]
      }
    ];

    try {
      // Usamos for...of para que el await funcione secuencialmente y respete las dependencias de FK
      for (const data of seedData) {
        this.logger.log(`Sembrando jerarquía para: ${data.email}...`);

        // 1. Crear Usuario
        const user = this.userRepo.create({
          email: data.email,
          password: 'Password123*', 
        });
        const savedUser = await this.userRepo.save(user);

        // 2. Crear Perfil
        const profile = this.profileRepo.create({
          user_id: savedUser.id,
          name: data.email.split('@')[0], // Usar el nombre del email como name
          lastname: 'Patient', // Apellido genérico
          ci: `CI-${savedUser.id}`, // Usar el ID del usuario como CI único
        });
        await this.profileRepo.save(profile);

        // 3. Crear Paciente
        const patient = this.patientRepo.create({
          user_id: savedUser.id, 
          hospital: data.hospital,
        });
        const savedPatient = await this.patientRepo.save(patient);

        // 4. Crear Prescription
        const prescription = this.prescriptionRepo.create({
          patient: savedPatient,
          instrucciones_globales: data.instrucciones,
          fecha_inicio_receta: data.fechaInicio,
          fecha_fin_receta: data.fechaFin,
        });
        const savedPrescription = await this.prescriptionRepo.save(prescription);

        // 5. Crear Medications y sus Notificaciones
        // (Iteramos por si en el futuro decides agregar más de un medicamento por receta)
        for (const medData of data.meds) {
          const medication = this.medicationRepo.create({
            nombre: medData.nombre,
            dosis: medData.dosis,
            frecuencia_horas: medData.freq,
            prescription_id: savedPrescription.id,
          });
          const savedMedication = await this.medicationRepo.save(medication);

          // Lógica básica: si el estado es NO_TOMADO, el tiempo_tomado es undefined
          const notification = this.notificationRepo.create({
            medication: savedMedication,
            tiempo_tomado: medData.estado === MedicationNotificationStatus.NO_TOMADO 
              ? undefined 
              : new Date(),
            estado: medData.estado,
            frecuencias_horas: medData.freq,
          });
          await this.notificationRepo.save(notification);
        }
      }

      this.logger.log('Sembrado de datos finalizado con éxito ✅');
    } catch (error) {
      this.logger.error('Error ejecutando el seeder', error);
    }
  }
}