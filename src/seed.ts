import { NestFactory } from '@nestjs/core';
import { SeederModule } from './database/seeders/seeder.module';
import { SeederService } from './database/seeders/seeder.service';

async function bootstrap() {
  // Creamos un contexto de aplicación (sin levantar el servidor HTTP)
  const app = await NestFactory.createApplicationContext(SeederModule);
  
  const seeder = app.get(SeederService);
  try {
    await seeder.seed();
  } catch (error) {
    console.error('Fallo al ejecutar el seeder', error);
  } finally {
    // Es importante cerrar la app para que la conexión a la BD termine y el script finalice
    await app.close();
  }
}

bootstrap();