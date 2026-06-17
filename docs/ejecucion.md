# Ejecucion

## Desarrollo

```powershell
npm run start:dev
```

Por defecto escucha en `PORT=3000`.

## Produccion local

```powershell
npm run build
npm run start:prod
```

## URLs importantes

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Check basico: `http://localhost:3000/`

Si cambias `PORT`, ajusta las URLs. Por ejemplo con `PORT=3001`:

- `http://localhost:3001`
- `http://localhost:3001/docs`

## Servicios externos opcionales o requeridos por funcionalidad

- PostgreSQL: requerido para iniciar correctamente.
- SMTP: requerido para recuperacion de contrasena.
- S3/MinIO: requerido para carga y lectura de archivos.
- Amazon Polly: requerido para audio de instrucciones.
- Groq: requerido para procesamiento IA de recetas.
- API Python de vision: requerida para extraccion y verificacion visual de medicamentos.

## Prueba rapida

```powershell
curl http://localhost:3000/
```

Respuesta esperada:

```text
Hello World!
```
