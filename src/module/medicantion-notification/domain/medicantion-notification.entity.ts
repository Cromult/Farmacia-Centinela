// src/module/medicantion-notification/domain/medicantion-notification.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Medication } from 'src/module/medications/domain/medications.entity';
import { generateUniqueId } from '../../../utils/IDUNICOS/unique-id.util';
export enum MedicationNotificationStatus {
  TIEMPO = 'TIEMPO',
  DESTIEMPO = 'DESTIEMPO',
  NO_TOMADO = 'NO_TOMADO',
}
@Entity('medicantion_notifications')
export class MedicantionNotification {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;
  // === Relación con Medication ===
  @ManyToOne(
    () => Medication,
    (medication) => medication.notifications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'medication_id' })
  medication!: Medication;

  @Column({ type: 'varchar', length: 27, name: 'medication_id' })
  medication_id!: string;
  // === Datos ===

  @Column({
    type: 'timestamptz',
    name: 'tiempo_tomado',
    nullable: true,
  })
  tiempo_tomado?: Date;

  @Column({
    type: 'enum',
    enum: MedicationNotificationStatus,
    default: MedicationNotificationStatus.NO_TOMADO,
  })
  estado!: MedicationNotificationStatus;

  @Column({
    type: 'int',
    name: 'frecuencias_horas',
  })
  frecuencias_horas!: number;

  // === Auditoría ===

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deleted_at?: Date | null;
  constructor(partial?: Partial<Medication>) {
    if (partial) Object.assign(this, partial);
    if (!this.id) this.id = generateUniqueId('MEDNO', 6);
  }
}
