// src/modules/medications-doc/domain/medications-doc.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  Index,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { generateUniqueId } from '../../../utils/IDUNICOS/unique-id.util';
import { Media } from '../../media/domain/media.entity';
import { Medication } from 'src/module/medications/domain/medications.entity';

@Entity('submissions_docs')
export class MedicationsDoc {
  @PrimaryColumn({ type: 'varchar', length: 50 }) // "SUBDOC-<ts>-XXXXXX"
  id!: string;

  @Index()
  @ManyToOne(() => Medication, (m) => m.medications_docs)
  @JoinColumn({ name: 'medication_id' })
  medication!: Medication;

  @Column({ name: 'medication_id', type: 'varchar', length: 50 })
  medication_id!: string;

  // === Media (1–1). Igual que en Video ===
  @Index({ unique: true })
  @Column({ name: 'media_id', type: 'varchar', length: 27, nullable: true })
  media_id?: string | null;

  @Column({
    type: 'real', // 'real' en PostgreSQL equivale a float32, el tamaño exacto de DINOv2
    array: true, // Indica que almacenará una lista/arreglo
    nullable: true,
    name: 'embedding_vector',
  })
  embedding_vector?: number[] | null;

  @OneToOne(() => Media, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'media_id', referencedColumnName: 'id' })
  media?: Media | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  constructor(partial?: Partial<MedicationsDoc>) {
    if (partial) Object.assign(this, partial);
    if (!this.id) this.id = generateUniqueId('SUBDOC', 6);
  }
}
