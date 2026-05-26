import { User } from 'src/module/users/domain/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_roles')
export class UserRole {
  constructor(partial?: Partial<UserRole>) {
    if (partial) Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  user_id!: number | string;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role_name!: string;

  @ManyToOne(() => User, (u) => u.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
