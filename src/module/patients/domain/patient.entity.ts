//src/module/patients/domain/patient.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Profile } from '../../profiles/domain/profile.entity';
import { Prescription } from '../../prescriptions/domain/prescriptions.entity';
@Entity('patients')
export class Patient {
  // PK = FK → profiles.user_id (shared primary key)
  @PrimaryColumn({ type: 'varchar', length: 27, name: 'user_id' })
  user_id!: string;

  @OneToOne(() => Profile, (p) => p.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  profile!: Profile;

  // === Datos Paciente ===

  @Column({
    type: 'varchar',
    length: 150,
    name: 'hospital',
    nullable: true,
  })
  hospital?: string;

  @OneToMany(() => Prescription, (prescription) => prescription.patient)
  prescriptions!: Prescription[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;
}
