# Base de datos

## Motor recomendado

PostgreSQL es el motor recomendado. Aunque el codigo permite `DB_TYPE=mysql`, varias entidades usan tipos propios de PostgreSQL como `jsonb`, `timestamptz` y arreglos `real[]`.

## Entidades principales

- `users`: usuarios, email, password, estado, reset code y auditoria.
- `profiles`: datos personales, CI, telefono, foto de perfil y relacion con usuario.
- `patients`: datos de paciente, hospital y relacion con perfil.
- `prescriptions`: recetas, instrucciones y fechas.
- `medications`: medicamentos, dosis, frecuencia, cantidad, duracion y receta.
- `medicantion_notifications`: tomas registradas, estado y frecuencia.
- `media`: metadatos de archivos en S3/MinIO.
- `submissions_docs`: documentos de medicamentos, media asociada y embedding visual.
- `user_roles`: roles asociados a usuarios.

## Relaciones principales

- `users` 1:1 `profiles`.
- `profiles` 1:1 `patients`.
- `patients` 1:N `prescriptions`.
- `prescriptions` 1:N `medications`.
- `medications` 1:N `submissions_docs`.
- `medications` 1:N `medicantion_notifications`.
- `profiles` 1:1 `media` para foto de perfil.
- `submissions_docs` 1:1 `media`.
- `users` 1:N `user_roles`.

## Migraciones

No hay migraciones activas en el repositorio. Se removieron los scripts de migracion porque no existe una configuracion TypeORM de migraciones lista para ejecutar.

Para una VM de presentacion, el esquema puede crearse con:

```env
DB_SYNCHRONIZE=true
```

Para produccion o evaluaciones mas estrictas, se recomienda agregar migraciones TypeORM reales y desactivar synchronize.

## Seeds

Existe un seed en:

- `src/seed.ts`
- `src/database/seeders/seeder.module.ts`
- `src/database/seeders/seeder.service.ts`

Comando:

```powershell
npm run seed
```

El seed carga datos demo para Farmacia Centinela. No debe tratarse como dato productivo.
