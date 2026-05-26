// src/modules/medications-doc/presentation/dtos/get-medications-doc.dto.ts

export class GetMedicationsDocDto {
  id!: string;
  medication_id!: string;
  embedding_vector?: number[] | null;
  media_id?: string | null;
  media_url?: string | null;
  created_at!: Date;
  updated_at!: Date;

  static fromEntity(entity: any, mediaUrl?: string | null): GetMedicationsDocDto {
    const dto = new GetMedicationsDocDto();

    dto.id = entity.id;

    // ✅ FIX AQUÍ
    dto.medication_id = entity.medication_id;
    dto.embedding_vector = entity.embedding_vector ?? null;

    dto.media_id = entity.media_id ?? null;
    dto.media_url = mediaUrl ?? undefined;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;

    return dto;
  }
}
