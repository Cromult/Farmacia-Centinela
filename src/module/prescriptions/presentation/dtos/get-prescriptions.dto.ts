// src/modules/prescriptions/presentation/dtos/get-prescriptions.dto.ts

export class GetPrescriptionDto {
  id!: string;
  patient_id!: string;

  instrucciones_globales!: string;
  fecha_inicio_receta!: Date;
  fecha_fin_receta!: Date;

  created_at!: Date;
  updated_at!: Date;

  static fromEntity(prescription: any): GetPrescriptionDto {
    const dto = new GetPrescriptionDto();

    dto.id = prescription.id;
    dto.patient_id = prescription.patient_id;

    dto.instrucciones_globales = prescription.instrucciones_globales;
    dto.fecha_inicio_receta = prescription.fecha_inicio_receta;
    dto.fecha_fin_receta = prescription.fecha_fin_receta;

    dto.created_at = prescription.created_at;
    dto.updated_at = prescription.updated_at;

    return dto;
  }
}
