// src/module/prescriptions/domain/prescriptions.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
  OneToMany,
} from 'typeorm';
import { generateUniqueId } from '../../../utils/IDUNICOS/unique-id.util';
import { Patient } from '../../patients/domain/patient.entity';
import { Medication } from 'src/module/medications/domain/medications.entity';

@Entity('prescriptions')
export class Prescription {
  // ID personalizado
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id!: string;

  // Relación: muchas prescriptions pertenecen a un patient
  @ManyToOne(() => Patient, (patient) => patient.prescriptions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @OneToMany(() => Medication, (m) => m.prescription)
  medications!: Medication[];

  // Exponer FK sin duplicar columna manual
  @RelationId((p: Prescription) => p.patient)
  patient_id!: string;

  // Campos propios
  @Column({ type: 'text' })
  instrucciones_globales!: string;

  @Column({ type: 'date' })
  fecha_inicio_receta!: Date;

  @Column({ type: 'date' })
  fecha_fin_receta!: Date;

  // Auditoría
  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at!: Date;

  constructor(partial?: Partial<Prescription>) {
    if (partial !== undefined) {
      Object.assign(this, partial);
    }
    if (!this.id) {
      this.id = generateUniqueId('PRSC', 6);
    }
  }
}
