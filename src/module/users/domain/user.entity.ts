// src/module/users/domain/user.entity.ts
import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
} from 'typeorm';

import { Profile } from 'src/module/profiles/domain/profile.entity';
import { UserRole } from 'src/module/user-roles/domain/user-role.entity';
import { generateUniqueId } from 'src/utils/IDUNICOS/unique-id.util';
@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;

  @Column({ type: 'varchar', length: 6, nullable: true })
  reset_code!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_code_expires!: Date | null;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles!: UserRole[];

  @OneToOne(() => Profile, (p) => p.user, { cascade: true })
  profile!: Profile;

  constructor(partial?: Partial<User>) {
    if (partial) Object.assign(this, partial);
    if (!this.id) this.id = generateUniqueId('USER', 6);
  }
}
