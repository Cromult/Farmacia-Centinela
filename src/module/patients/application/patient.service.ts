//src/module/patients/application/patient.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as patientRepositoryInterface from '../domain/patient.repository.interface';
import { Patient } from '../domain/patient.entity';
import { CreatePatientDto } from '../presentation/dtos/create-patient.dto';
import { UpdatePatientDto } from '../presentation/dtos/update-patient.dto';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';
import { GetPatientDto } from '../presentation/dtos/get-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @Inject(patientRepositoryInterface.PATIENT_REPOSITORY)
    private readonly repo: patientRepositoryInterface.IPatientRepository,
  ) {}

  private toGetDto(entity: Patient): GetPatientDto {
    return GetPatientDto.fromEntity(entity);
  }

  private toGetDtoArray(entities: Patient[]): GetPatientDto[] {
    return entities.map((e) => GetPatientDto.fromEntity(e));
  }

  async create(dto: CreatePatientDto): Promise<GetPatientDto> {
    const entity = new Patient();
    entity.user_id = dto.user_id;
    entity.hospital = dto.hospital;

    const saved = await this.repo.save(entity);
    return this.toGetDto(saved);
  }

  async findAll(): Promise<GetPatientDto[]> {
    const data = await this.repo.findAll();
    return this.toGetDtoArray(data);
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<GetPatientDto>> {
    const { data, meta } = await this.repo.findAllPaginated(page, limit);
    return { data: this.toGetDtoArray(data), meta };
  }

  async findOne(user_id: string): Promise<GetPatientDto> {
    const found = await this.repo.findOne(user_id);
    if (!found) throw new NotFoundException('Patient not found');
    return this.toGetDto(found);
  }

  async update(
    user_id: string,
    dto: UpdatePatientDto,
  ): Promise<GetPatientDto> {
    const found = await this.repo.findOne(user_id);
    if (!found) throw new NotFoundException('Patient not found');

    const updated = await this.repo.update(user_id, {
      hospital: dto.hospital,
    });

    return this.toGetDto(updated);
  }

  async softDelete(user_id: string): Promise<void> {
    await this.repo.softDelete(user_id);
  }
}