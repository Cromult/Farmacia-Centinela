# Endpoints principales

La documentacion interactiva esta disponible en:

```text
http://localhost:3000/docs
```

## App

- `GET /`: check basico, responde `Hello World!`.

## Auth

- `POST /auth/login`: login con email y password.
- `POST /auth/forgot-password`: solicita codigo por email.
- `POST /auth/reset-password`: restablece contrasena con codigo.
- `GET /auth/me`: datos basicos del usuario autenticado.
- `GET /auth/profile`: perfil completo del usuario autenticado.
- `POST /auth/refresh`: refresca cookies JWT.
- `POST /auth/logout`: limpia cookies de autenticacion.

## Users

- `GET /users`: listar usuarios.
- `GET /users/:id`: obtener usuario.
- `POST /users`: crear usuario.
- `PATCH /users/:id`: actualizar usuario.
- `PATCH /users/me/password`: cambiar contrasena propia.
- `DELETE /users/:id`: eliminar usuario.

## Profiles

- `POST /profiles`: crear perfil.
- `GET /profiles`: listar perfiles.
- `GET /profiles/:user_id`: obtener perfil.
- `PATCH /profiles/:user_id`: actualizar perfil.
- `DELETE /profiles/:user_id`: eliminar perfil.

## Patients

- `POST /patients`: crear paciente.
- `POST /patients/full`: crear usuario, perfil y paciente.
- `GET /patients`: listar pacientes.
- `GET /patients/:user_id`: obtener paciente.
- `PATCH /patients/:user_id`: actualizar paciente.
- `DELETE /patients/:user_id`: eliminar paciente.

## Prescriptions

- `GET /prescriptions`: listar recetas.
- `GET /prescriptions/dashboard/me`: dashboard del paciente autenticado.
- `GET /prescriptions/me/all`: recetas del usuario autenticado.
- `GET /prescriptions/:id`: obtener receta.
- `GET /prescriptions/:id/history`: historial de tomas.
- `GET /prescriptions/:id/audio`: audio con Amazon Polly.
- `POST /prescriptions`: crear receta.
- `PATCH /prescriptions/:id`: actualizar receta.
- `DELETE /prescriptions/:id`: eliminar receta.
- `POST /prescriptions/ai/process`: procesa texto libre con Groq.

## Medications

- `GET /medications`: listar medicamentos.
- `GET /medications/me/latest-prescription`: medicamentos de la ultima receta del usuario.
- `GET /medications/by-prescription/:prescriptionId`: listar por receta.
- `GET /medications/by-prescription/:prescriptionId/count`: contar por receta.
- `GET /medications/lightweight`: listado liviano por IDs de receta.
- `GET /medications/:id`: obtener medicamento.
- `POST /medications`: crear medicamento con archivos.
- `PATCH /medications/:id`: actualizar medicamento y archivos.
- `PATCH /medications/:id/image`: actualizar imagen/documentos.
- `POST /medications/:id/docs/by-media/:mediaId`: asociar media existente.
- `DELETE /medications/:id`: eliminar medicamento.

## Medications Docs

- `GET /medications-docs`: listar documentos.
- `GET /medications-docs/:id`: obtener documento.
- `POST /medications-docs`: crear documento.
- `PATCH /medications-docs/:id`: actualizar documento.
- `POST /medications-docs/:id/media`: subir media a documento.
- `DELETE /medications-docs/:id/media`: desasociar media.
- `DELETE /medications-docs/:id`: eliminar documento.

## Media

- `POST /media/upload`: subir archivo.
- `GET /media/:id/url`: obtener URL firmada.

## Notifications

- `POST /medicantion-notifications`: registrar toma.
- `GET /medicantion-notifications/history/me`: historial del usuario autenticado.
- `GET /medicantion-notifications`: listar notificaciones.
- `GET /medicantion-notifications/medication/:medication_id`: listar por medicamento.
- `GET /medicantion-notifications/:id`: obtener notificacion.
- `PATCH /medicantion-notifications/:id`: actualizar notificacion.
- `DELETE /medicantion-notifications/:id`: eliminar notificacion.

## User Roles

- `POST /user-roles`: crear rol de usuario.
- `DELETE /user-roles/:id`: eliminar rol.
