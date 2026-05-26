// src/modules/medications-docs/medications-doc.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { MedicationsDoc } from './domain/medications-doc.entity';
import { MedicationsDocService } from './application/medications-doc.service';
import { MedicationsDocController } from './presentation/controllers/medications-doc.controller';
import { MedicationsDocRepositoryImpl } from './infrastructure/repositories/medications-doc.repository.impl';

import { MediaModule } from '../media/media.module'; // para MediaService

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicationsDoc]),
    MediaModule, // necesario para manejar media uploads
    HttpModule, // necesario para HttpService
  ],
  controllers: [MedicationsDocController],
  providers: [
    MedicationsDocService,
    { provide: 'IMedicationsDocRepository', useClass: MedicationsDocRepositoryImpl },
  ],
  exports: [
    MedicationsDocService,
    'IMedicationsDocRepository',
  ],
})
export class MedicationsDocModule {}
