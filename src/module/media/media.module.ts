// src/modules/media/media.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './domain/media.entity';
import { MediaService } from './applications/media.service';
import { MediaController } from './presentation/media.controller';
import { MediaZipService } from './applications/media-zip.service';
import { 
  s3ClientProvider, 
  s3ClientForSigningProvider,
  S3_CLIENT 
} from './infrastructure/s3-client.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  providers: [
    s3ClientProvider,
    s3ClientForSigningProvider,
    MediaService,
    MediaZipService,
  ],
  controllers: [MediaController],
  exports: [MediaService, MediaZipService],
})
export class MediaModule implements OnModuleInit {
  constructor(private readonly mediaService: MediaService) {}

  async onModuleInit() {
    try {
      await this.mediaService.ensureBucket();
    } catch (e) {
      // console.error('No se pudo asegurar el bucket en el arranque', e);
    }
  }
}
