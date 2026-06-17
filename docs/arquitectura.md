# Arquitectura del Backend

## Resumen

Backend NestJS con TypeScript, TypeORM y PostgreSQL recomendado. El sistema esta organizado por modulos de negocio y cada modulo sigue una separacion por capas:

- `presentation`: controladores HTTP y DTOs.
- `application`: servicios, casos de uso y orquestacion.
- `domain`: entidades TypeORM e interfaces de repositorio.
- `infrastructure`: implementaciones de repositorios, guards, strategies, providers y adaptadores externos.

## Modulos principales

- `auth`: login, refresh, logout, perfil autenticado, recuperacion de contrasena, JWT y cookies.
- `users`: CRUD de usuarios, cambio de contrasena y recuperacion.
- `profiles`: datos personales asociados a usuarios.
- `patients`: datos de paciente y creacion completa usuario/perfil/paciente.
- `prescriptions`: recetas, dashboard, historial y audio con Amazon Polly.
- `medications`: medicamentos asociados a recetas, archivos e imagenes.
- `medications-doc`: documentos asociados a medicamentos y vectores de embedding.
- `medicantion-notification`: registro e historial de tomas de medicamentos.
- `media`: carga de archivos y URLs firmadas con S3/MinIO.
- `user-roles`: asignacion basica de roles.
- `hashing`: abstraccion de hash de contrasenas con bcrypt.

## Servicios principales

- `AuthService`: credenciales, tokens JWT, cookies, reset de contrasena y perfil autenticado.
- `UserService`: administracion de usuarios.
- `ProfilesService`: administracion de perfiles.
- `PatientService` y `PatientOrchestratorService`: pacientes y creacion completa.
- `PrescriptionService`: recetas, dashboard, historial y audio.
- `RecetaCompletaService`: procesamiento de texto libre con Groq.
- `MedicationService`: medicamentos, archivos, documentos y vectores visuales.
- `MedicationsDocService`: documentos de medicamento y URLs firmadas.
- `MedicantionNotificationService`: notificaciones e historial de tomas.
- `MediaService`: S3/MinIO, bucket, upload, descarga y URLs firmadas.

## Seguridad

La autenticacion usa JWT en cookies HTTP-only:

- `access_token`: cookie de acceso.
- `refresh_token`: cookie de refresco limitada a `/auth/refresh`.

`JwtAuthGuard` esta registrado como guard global en `AuthModule`, con excepciones mediante `@Public()`. `RolesGuard` tambien esta registrado globalmente, aunque actualmente no se detecto uso de `@Roles()`.

## Servicios externos

- PostgreSQL: persistencia principal.
- S3/MinIO: almacenamiento de archivos.
- SMTP: envio de codigos de recuperacion.
- Amazon Polly: generacion de audio para instrucciones de recetas.
- Groq: extraccion de datos estructurados desde recetas en texto libre.
- API Python de vision: endpoints hardcodeados en `http://localhost:8000/api/vision/extract` y `http://localhost:8000/api/vision/verify`.
