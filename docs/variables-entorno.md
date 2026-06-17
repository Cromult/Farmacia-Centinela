# Variables de entorno

Usa `.env.example` como plantilla. No guardes secretos reales en Git ni en documentacion.

## App

- `PORT`: puerto HTTP del backend. Default recomendado: `3000`.
- `NODE_ENV`: ambiente, por ejemplo `development`, `test`, `production`.

## Base de datos

- `DB_TYPE`: `postgres` recomendado.
- `DB_HOST`: host de la base de datos.
- `DB_PORT`: puerto de la base de datos. PostgreSQL usa `5432`.
- `DB_USER`: usuario de base de datos.
- `DB_PASSWORD`: contrasena de base de datos.
- `DB_NAME`: nombre de la base de datos.
- `DB_SYNCHRONIZE`: si TypeORM sincroniza esquema automaticamente.
- `DB_LOGGING`: habilita logs SQL.
- `DB_SSL_MODE`: habilita SSL para PostgreSQL si es `true`.

## Auth

- `JWT_ACCESS_SECRET`: secreto para access token.
- `JWT_REFRESH_SECRET`: secreto para refresh token.
- `JWT_ACCESS_TTL`: duracion del access token.
- `JWT_REFRESH_TTL`: duracion del refresh token.
- `SKEW`: margen restado a cookies frente al TTL JWT.
- `COOKIE_SECURE`: `true` si se usa HTTPS.
- `COOKIE_SAMESITE`: `lax`, `strict` o `none`.

## Mailer

- `MAIL_HOST`: host SMTP.
- `MAIL_PORT`: puerto SMTP.
- `MAIL_USER`: usuario SMTP.
- `MAIL_PASS`: password SMTP.

## S3 / MinIO

- `S3_REGION`: region.
- `S3_ENDPOINT`: endpoint interno usado por el backend.
- `S3_PUBLIC_ENDPOINT`: endpoint publico usado para URLs firmadas.
- `S3_BUCKET`: bucket.
- `S3_FORCE_PATH_STYLE`: requerido normalmente para MinIO.
- `S3_ACCESS_KEY`: access key.
- `S3_SECRET_KEY`: secret key.
- `S3_PRESIGN_EXPIRES_SECONDS`: expiracion de URLs firmadas.

## AWS Polly

- `AWS_REGION`: region para Polly.

## IA

- `GROQ_API_KEY`: API key para Groq.

## BigBlueButton

- `BBB_BASE_URL`: URL base de BigBlueButton.
- `BBB_SECRET`: secreto compartido.

Estas variables solo son necesarias si se usan los helpers BBB.
