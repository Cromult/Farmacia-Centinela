// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger'; // <-- Importas tu función
import cookieParser from 'cookie-parser'; // Necesario para la estrategia JWT de cookies
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { PollyClient, DescribeVoicesCommand } from '@aws-sdk/client-polly';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common/services/logger.service';

async function verifyS3Storage(app: any) {
  const logger = new Logger('S3Storage');
  try {
    const configService = app.get(ConfigService);

    // 1. Preparamos la configuración base
    const s3Options: any = {
      region: configService.get('s3.region'),
      forcePathStyle: configService.get('s3.forcePathStyle'),
    };

    // 2. Si hay un endpoint (ej. localhost:9000 para MinIO), lo agregamos
    const endpoint = configService.get('s3.endpoint');
    if (endpoint) {
      s3Options.endpoint = endpoint;
    }

    // 3. Si hay credenciales en el .env, las usamos.
    // Si NO hay credenciales (estamos en AWS), NO mandamos este bloque
    // y el SDK usará el Rol de IAM de la EC2 mágicamente.
    const accessKeyId = configService.get('s3.accessKeyId');
    const secretAccessKey = configService.get('s3.secretAccessKey');

    if (accessKeyId && secretAccessKey) {
      s3Options.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    // 4. Instanciamos el cliente con las opciones dinámicas
    const s3Client = new S3Client(s3Options);

    await s3Client.send(new ListBucketsCommand({}));
    logger.log('✅ S3/MinIO storage conectado correctamente');
  } catch (err: any) {
    logger.error('❌ S3/MinIO storage no disponible o credenciales inválidas');
    logger.error(err?.message || err);
  }
}

async function verifyPollyConnection(app: any) {
  const logger = new Logger('PollyAI');
  try {
    const configService = app.get(ConfigService);
    // Tomamos la región, por defecto el norte de virginia
    const region =
      configService.get('polly.region') ||
      configService.get('AWS_REGION') ||
      'us-east-1';

    // 1. Instanciamos el cliente. Al no pasar "credentials", AWS SDK
    // buscará automáticamente los permisos del perfil de la instancia EC2.
    const pollyClient = new PollyClient({ region });

    // 2. Probamos conectividad solicitando las voces disponibles en español
    await pollyClient.send(
      new DescribeVoicesCommand({ LanguageCode: 'es-US' }),
    );

    logger.log('✅ Amazon Polly (IA de Voz) conectado correctamente');
  } catch (err: any) {
    logger.error(
      '❌ Amazon Polly no disponible o faltan permisos en el IAM Role',
    );
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
  await verifyPollyConnection(app);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
