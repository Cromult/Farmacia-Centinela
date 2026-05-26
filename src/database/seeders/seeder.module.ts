import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Importa tus entidades
import { User } from 'src/module/users/domain/user.entity';
import { Profile } from 'src/module/profiles/domain/profile.entity';
import { Patient } from 'src/module/patients/domain/patient.entity';
import { Prescription } from 'src/module/prescriptions/domain/prescriptions.entity';
import { Medication } from 'src/module/medications/domain/medications.entity';
import { MedicantionNotification } from 'src/module/medicantion-notification/domain/medicantion-notification.entity';

import { SeederService } from './seeder.service';
import { AppModule } from 'src/app.module'; // Importamos AppModule para traer la conexión a DB

@Module({
  imports: [
    // Importamos AppModule para heredar la conexión a Postgres de forma transparente
    AppModule,
    TypeOrmModule.forFeature([
      User,
      Profile,
      Patient,
      Prescription,
      Medication,
      MedicantionNotification,
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
