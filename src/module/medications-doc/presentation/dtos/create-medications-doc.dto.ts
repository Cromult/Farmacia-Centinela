// src/modules/medications-docs/presentation/dtos/create-medications-doc.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsDate } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMedicationsDocDto {
  @ApiProperty({
    description: 'ID de la medication a la que pertenece el documento',
    example: 'MED-1693345600000-A1B2C3',
  })
  @IsString()
  @IsNotEmpty({ message: 'El medication_id es obligatorio' })
  medication_id?: string;

  @ApiPropertyOptional({
    description: 'Opcional: media_id ya existente si quieres asociar el archivo al crear',
    example: 'MEDIA-1693043205123-ABC123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  media_id?: string;
}
