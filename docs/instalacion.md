# Instalacion

## Requisitos

- Node.js 22 LTS recomendado.
- npm.
- PostgreSQL 14 o superior recomendado.
- Git, si se va a clonar desde repositorio.

## Instalar dependencias

```powershell
npm install
```

## Configurar variables de entorno

Crea un archivo `.env` usando `.env.example` como referencia.

```powershell
Copy-Item .env.example .env
```

Edita los valores sensibles y de infraestructura:

- `DB_*`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `MAIL_*`
- `S3_*`
- `AWS_REGION`
- `GROQ_API_KEY`

No guardes credenciales reales en documentacion ni en Git.

## Preparar PostgreSQL

Ejemplo SQL:

```sql
CREATE DATABASE farmacia_centinela;
CREATE USER backend_user WITH PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE farmacia_centinela TO backend_user;
```

Configura el `.env` con esos datos.

## Crear tablas

Actualmente el proyecto usa TypeORM con `DB_SYNCHRONIZE=true` por defecto. En una VM de presentacion puede usarse para crear el esquema automaticamente al arrancar.

Para entornos mas controlados se recomienda agregar migraciones reales antes de produccion.

## Cargar datos de ejemplo

```powershell
npm run seed
```

El seeder crea usuarios, perfiles, pacientes, recetas, medicamentos y notificaciones de ejemplo. Debe usarse solo como dato demo.
