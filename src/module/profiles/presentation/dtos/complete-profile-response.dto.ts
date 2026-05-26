// src/modules/profiles/presentation/dtos/complete-profile-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserDataDto {
  @ApiProperty({ example: 'juan.perez@uvirtual.local' })
  email!: string;
}

class StudentDataDto {
  @ApiPropertyOptional({ example: 'Colegio San Calixto' })
  previousSchool?: string;

  @ApiPropertyOptional({ example: '2023-12-15' })
  degreeIssueDate?: string;

  @ApiPropertyOptional({ example: '2024-01-10' })
  admissionDate?: string;
}

class ProfessorDataDto {
  @ApiPropertyOptional({ example: '+591 78945612' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Ingeniero de Sistemas' })
  profession?: string;

  @ApiPropertyOptional({ example: 'Inteligencia Artificial' })
  fieldOfExpertise?: string;

  @ApiPropertyOptional({ example: 'Doctorado' })
  academicDegree?: string;

  @ApiPropertyOptional({ example: 'Maestría en ML' })
  otherDegrees?: string;
}

export class CompleteProfileResponseDto {
  user_id!: string;
  user!: {
    email?: string | null;
  };
  name!: string;
  lastname!: string;
  birthdate?: string;
  birthplace?: string;
  nationality?: string;
  ci!: string;
  gender?: string;

  student?: {
    previousSchool?: string;
    degreeIssueDate?: string;
    admissionDate?: string;
  };

  professor?: {
    phoneNumber?: string;
    profession?: string;
    fieldOfExpertise?: string;
    academicDegree?: string;
    otherDegrees?: string;
  };
}
