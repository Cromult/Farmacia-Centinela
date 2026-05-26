// src/modules/medications/presentation/dtos/get-medications.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Medication } from '../../domain/medications.entity';

export class MedicationDocSummary {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  media_id!: string;

  @ApiProperty({ required: false, nullable: true })
  media_url?: string | null;
}

export class GetMedicationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  dosis!: string;

  @ApiProperty()
  descripcion!: string;

  @ApiProperty()
  frecuencia_horas!: number;

  @ApiProperty()
  cantidad!: number;

  @ApiProperty()
  duracion_dias!: number;

  @ApiProperty()
  via_administracion!: string;

  @ApiProperty()
  prescription_id!: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  @ApiProperty({ type: [MedicationDocSummary], required: false })
  medications_docs?: MedicationDocSummary[];

  static fromEntity(
    entity: Medication,
    docsUrls?: Record<string, string | null>,
  ): GetMedicationDto {
    const dto = new GetMedicationDto();

    dto.id = entity.id;
    dto.nombre = entity.nombre;
    dto.dosis = entity.dosis;
    dto.descripcion = entity.descripcion;
    dto.frecuencia_horas = entity.frecuencia_horas;
    dto.cantidad = entity.cantidad;
    dto.duracion_dias = entity.duracion_dias;
    dto.via_administracion = entity.via_administracion;
    dto.prescription_id = entity.prescription_id;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;

    if ((entity as any).medications_docs && Array.isArray((entity as any).medications_docs)) {
      dto.medications_docs = (entity as any).medications_docs.map((d: any) => {
        return {
          id: d.id,
          media_id: d.media_id,
          media_url: docsUrls ? docsUrls[d.id] : undefined,
        };
      });
    }

    return dto;
  }
}