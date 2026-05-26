// src/modules/medications/presentation/dtos/get-my-medications.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class GetMyMedicationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  dosis!: string;

  @ApiProperty()
  frecuencia_horas!: number;

  @ApiProperty()
  next_take_at!: Date;

  @ApiProperty({ nullable: true })
  image_url!: string | null;

  static fromData(data: any): GetMyMedicationDto {
    const dto = new GetMyMedicationDto();

    dto.id = data.id;
    dto.nombre = data.nombre;
    dto.dosis = data.dosis;
    dto.frecuencia_horas = data.frecuencia_horas;
    dto.next_take_at = data.next_take_at;
    dto.image_url = data.image_url ?? null;

    return dto;
  }
}