import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './domain/user-role.entity';
import { UserRoleController } from './presentation/controllers/user-role.controller';
import { UserRoleService } from './application/user-role.service';
import { UserRoleRepositoryImpl } from './infrastructure/repositories/user-role.repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  controllers: [UserRoleController],
  providers: [
    UserRoleService,
    { provide: 'IUserRoleRepository', useClass: UserRoleRepositoryImpl },
  ],
  exports: ['IUserRoleRepository', UserRoleService],
})
export class UserRolesModule {}
