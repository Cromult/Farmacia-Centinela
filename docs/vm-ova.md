# Checklist VM / OVA

## Objetivo

Preparar una maquina virtual capaz de ejecutar el backend sin depender del proyecto Flutter.

## Software requerido

- Node.js 22 LTS.
- npm.
- PostgreSQL.
- Git, opcional si se clona el repo.
- MinIO, opcional si se probaran archivos.
- Servicio SMTP o Mailtrap, opcional si se probara recuperacion de contrasena.
- Credenciales AWS/IAM para Polly, opcional si se probara audio.
- API Python de vision en puerto `8000`, opcional si se probaran imagenes y verificacion visual.

## Pasos base

```powershell
npm install
Copy-Item .env.example .env
npm run start:dev
```

Crear base de datos PostgreSQL antes de iniciar:

```sql
CREATE DATABASE farmacia_centinela;
CREATE USER backend_user WITH PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE farmacia_centinela TO backend_user;
```

## Datos demo

```powershell
npm run seed
```

## Validacion

```powershell
curl http://localhost:3000/
```

Respuesta esperada:

```text
Hello World!
```

Abrir Swagger:

```text
http://localhost:3000/docs
```

## Faltantes recomendados antes de congelar la OVA

- Definir valores reales de `.env` dentro de la VM, sin subirlos al repositorio.
- Confirmar que PostgreSQL inicia automaticamente con la VM.
- Confirmar que el puerto del backend esta abierto.
- Confirmar si se incluira MinIO local o si se deshabilitaran pruebas de archivos.
- Confirmar si se incluira la API Python de vision o si se documentara como servicio no incluido.
- Ejecutar `npm run build`.
- Ejecutar `npm test`.
