// src/config/swagger.ts
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('UvirtualBack API')
    .setDescription('API para gestión universitaria')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Introduce tu token JWT aquí (sin "Bearer ")',
      },
      'JWT-auth', // 👈 nombre del esquema
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none', // 👈 endpoints colapsados por defecto
      defaultModelsExpandDepth: -1, // 👈 oculta "Schemas"
      persistAuthorization: true, // 👈 mantiene el JWT al recargar
    },
  });
}
