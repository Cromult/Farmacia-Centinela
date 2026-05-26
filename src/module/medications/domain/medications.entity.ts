// src/module/medications/domain/medications.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';

import { generateUniqueId } from '../../../utils/IDUNICOS/unique-id.util';

// Relaciones
import { Prescription } from '../../prescriptions/domain/prescriptions.entity';
import { MedicationsDoc } from 'src/module/medications-doc/domain/medications-doc.entity';
import { MedicantionNotification } from 'src/module/medicantion-notification/domain/medicantion-notification.entity';

@Entity('medications')
export class Medication {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  // --- Datos básicos ---
  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  dosis!: string;

  // Instrucciones específicas del medicamento
  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ name: 'frecuencia_horas', type: 'int' })
  frecuencia_horas!: number;

  // Cantidad total de pastillas/cápsulas/etc.
  @Column({ type: 'int' })
  cantidad!: number;

  // Duración del tratamiento
  @Column({ type: 'int' })
  duracion_dias!: number;

  // Oral, intravenosa, tópica, etc.
  @Column({
    type: 'varchar',
    length: 50,
    default: 'Oral',
  })
  via_administracion!: string;

  // --- Relación con Prescription (N medications : 1 prescription) ---
  @Index('idx_medications_prescription_id')
  @Column({ name: 'prescription_id', type: 'varchar', length: 50 })
  prescription_id!: string;

  @ManyToOne(() => Prescription, (p) => p.medications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'prescription_id', referencedColumnName: 'id' })
  prescription!: Prescription;

  // --- Relación con MedicationsDoc (1 medication : N medications-docs) ---
  @OneToMany(() => MedicationsDoc, (md) => md.medication, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  medications_docs!: MedicationsDoc[];

  @OneToMany(
    () => MedicantionNotification,
    (notification) => notification.medication,
  )
  notifications!: MedicantionNotification[];

  // --- Auditoría ---
  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  constructor(partial?: Partial<Medication>) {
    if (partial) Object.assign(this, partial);
    if (!this.id) this.id = generateUniqueId('MED', 6);
  }

  @BeforeInsert()
  private beforeInsertGenerateId() {
    if (!this.id) this.id = generateUniqueId('MED', 6);
  }
}
