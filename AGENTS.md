# AGENTS.md

## Proyecto

Backend NestJS con arquitectura modular:

- application
- presentation
- domain
- infrastructure

Usa TypeScript, NestJS, TypeORM, PostgreSQL, Swagger, DTOs, Guards y validaciones.

## Reglas generales

- Antes de modificar, analiza impacto con CodeGraph.
- No tocar archivos fuera del alcance pedido.
- No cambiar contratos de API sin avisar.
- No eliminar lógica existente sin justificar.
- Mantener nombres y estructura actual del proyecto.

## Comandos

- Instalar dependencias: npm install
- Ejecutar dev: npm run start:dev
- Build: npm run build
- Tests: npm test
- Lint: npm run lint

## Estilo NestJS

- Controllers solo reciben requests y llaman services/use cases.
- DTOs en presentation/dtos.
- Entities en domain.
- Repositories/adapters en infrastructure.
- Validar datos con class-validator.
- Documentar endpoints con Swagger.
- Usar exceptions de NestJS, no errores genéricos.

## TypeORM

- No romper relaciones existentes.
- Revisar entities antes de tocar migrations.
- Mantener nombres de columnas consistentes.
- Si se cambia una entity, explicar impacto en DB.

## Seguridad

- No exponer JWT_SECRET, contraseñas ni claves.
- No escribir credenciales reales en código.
- Mantener auth con guards/interceptors existentes.

## Flujo obligatorio antes de cambios grandes

1. Usar CodeGraph para ubicar archivos relacionados.
2. Listar archivos que se tocarán.
3. Explicar impacto.
4. Recién después modificar.
5. Ejecutar build o indicar si no se pudo.

## CodeGraph

* Usa CodeGraph antes de analizar impacto.
* Si se modifican muchos archivos o estructura del repo: ejecutar `codegraph sync`.
* Solo usar `codegraph index` si hubo cambios masivos o el índice parece inconsistente.
* No reindexar innecesariamente.
