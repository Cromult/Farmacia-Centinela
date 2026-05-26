// src/modules/profiles/domain/profile.entity.ts
import { Media } from 'src/module/media/domain/media.entity';
import { User } from 'src/module/users/domain/user.entity';
import { Patient } from 'src/module/patients/domain/patient.entity';
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryColumn({ type: 'varchar', length: 26, name: 'user_id' })
  user_id!: string;

  @OneToOne(() => User, (u) => u.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToOne(() => Patient, (s) => s.profile)
  patient?: Patient;

  // === Datos Profile ===
  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;
  @Column({ type: 'varchar', length: 100, name: 'lastname' })
  lastname!: string;
  // almacenado como DATE en DB; en DTO se valida como ISO string
  @Column({ type: 'date', name: 'birthdate', nullable: true })
  birthdate?: Date | string;
  @Column({ type: 'varchar', length: 120, name: 'birthplace', nullable: true })
  birthplace?: string;

  @Column({ type: 'varchar', length: 80, name: 'nationality', nullable: true })
  nationality?: string;

  @Column({ type: 'varchar', length: 30, name: 'ci', unique: true })
  ci!: string;

  @Column({ type: 'varchar', length: 20, name: 'gender', nullable: true })
  gender?: string;

  @Column({ type: 'varchar', length: 20, name: 'phone', nullable: true })
  phone?: string;

  @Index({ unique: true }) // opcional: evitar que una media sea usada por múltiples perfiles
  @Column({
    type: 'varchar',
    length: 26,
    name: 'profile_picture_media_id',
    nullable: true,
  })
  profile_picture_media_id?: string | null;

  @OneToOne(() => Media, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'profile_picture_media_id', referencedColumnName: 'id' })
  profile_picture?: Media | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // Soft delete
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;
}
