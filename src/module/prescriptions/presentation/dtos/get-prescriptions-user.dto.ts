// src/modules/prescriptions/presentation/dtos/get-prescriptions-user.dto.ts

export class GetPrescriptionUserDto {
  patient_name!: string;
  prescription_id!: string | null;
  total_medications!: number;
  next_medication!: {
    id: string;
    nombre: string;
    dosis: string;
    frecuencia_horas: number;
    next_take_at: Date;
    status: string;
  } | null;
}
