// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger'; // <-- Importas tu función
import cookieParser from 'cookie-parser'; // Necesario para la estrategia JWT de cookies
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common/services/logger.service';

async function verifyS3Storage(app: any) {
  const logger = new Logger('S3Storage');
  try {
    const configService = app.get(ConfigService);
    const s3Client = new S3Client({
      region: configService.get('s3.region'),
      endpoint: configService.get('s3.endpoint'),
      forcePathStyle: configService.get('s3.forcePathStyle'),
      credentials: {
        accessKeyId: configService.get('s3.accessKeyId'),
        secretAccessKey: configService.get('s3.secretAccessKey'),
      },
    });

    await s3Client.send(new ListBucketsCommand({}));
    logger.log('✅ S3/MinIO storage conectado correctamente');
  } catch (err: any) {
    logger.error('❌ S3/MinIO storage no disponible o credenciales inválidas');
    logger.error(err?.message || err);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // En desarrollo permite cualquier origen
    credentials: true, // Importante si usas cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.use(cookieParser()); // Habilita la lectura de cookies

  setupSwagger(app); // <-- Inicializas Swagger
  await verifyS3Storage(app);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
