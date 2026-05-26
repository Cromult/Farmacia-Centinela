// src/modules/media/domain/media.entity.ts
import {
  Entity, PrimaryColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index
} from 'typeorm';
import { generateUniqueId } from '../../../utils/IDUNICOS/unique-id.util';

@Entity('media')
export class Media {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id!: string; // ej. ulid de 26-27 chars

  @Index()
  @Column({ type: 'varchar', length: 128 })
  bucket!: string; // ej. 'uvirtual'

  @Index()
  @Column({ type: 'varchar', length: 512 })
  object_key!: string; // ruta/filename dentro del bucket

  @Column({ type: 'varchar', length: 256, nullable: true })
  original_name?: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  mime_type?: string;

  @Column({ type: 'bigint', nullable: true })
  size_bytes?: string; // guardar como string para bigints

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  constructor() {
    if (!this.id) {
      this.id = generateUniqueId('VIQUE', 6);
    }
  }
}
