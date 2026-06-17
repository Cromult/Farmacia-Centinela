# Farmacia Centinela Backend

Backend NestJS para gestion de usuarios, perfiles, pacientes, recetas medicas, medicamentos, documentos multimedia, notificaciones de tomas y autenticacion JWT.

## Tecnologia

- Node.js 22 LTS recomendado
- TypeScript
- NestJS 11
- TypeORM
- PostgreSQL recomendado
- Swagger/OpenAPI
- JWT con cookies HTTP-only
- S3/MinIO para archivos
- Amazon Polly para audio de instrucciones
- Groq para procesamiento de recetas con IA
- Mailer SMTP para recuperacion de contrasena

## Arquitectura

El proyecto usa arquitectura modular por capas:

- `presentation`: controladores y DTOs.
- `application`: servicios y casos de uso.
- `domain`: entidades e interfaces de repositorio.
- `infrastructure`: repositorios, guards, strategies y providers externos.

Modulos principales:

- `auth`
- `users`
- `profiles`
- `patients`
- `prescriptions`
- `medications`
- `medications-doc`
- `medicantion-notification`
- `media`
- `user-roles`
- `hashing`

## Instalacion rapida

```powershell
npm install
```

Crea un `.env` basado en `.env.example` y configura PostgreSQL.

```powershell
npm run start:dev
```

URLs principales:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Check basico: `http://localhost:3000/`

## Comandos

```powershell
npm install
npm run start:dev
npm run build
npm run start:prod
npm test
npm run test:e2e
npm run seed
```

## Documentacion

La documentacion tecnica inicial esta en:

- `docs/arquitectura.md`
- `docs/instalacion.md`
- `docs/ejecucion.md`
- `docs/endpoints.md`
- `docs/base-datos.md`
- `docs/variables-entorno.md`
- `docs/vm-ova.md`

## Notas para VM/OVA

Para una VM limpia se debe instalar Node.js, PostgreSQL, configurar `.env`, ejecutar `npm install`, levantar la base de datos y arrancar el backend con `npm run start:dev` o `npm run build` + `npm run start:prod`.

Algunas funciones dependen de servicios externos: S3/MinIO, SMTP, Groq, Amazon Polly y una API Python de vision en `http://localhost:8000`.
