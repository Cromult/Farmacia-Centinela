// src/modules/medications/infrastructure/repositories/medications.repository.impl.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';

import { IMedicationRepository } from '../../domain/medications.repository.interface';
import { Medication } from '../../domain/medications.entity';
import { MedicationsDoc } from '../../../medications-doc/domain/medications-doc.entity';
import { PaginationResult } from 'src/utils/types/pagination-result.interface';

@Injectable()
export class MedicationRepositoryImpl implements IMedicationRepository {
  constructor(
    @InjectRepository(Medication)
    private readonly repository: Repository<Medication>,

    @InjectRepository(MedicationsDoc)
    private readonly medicationDocRepo: Repository<MedicationsDoc>,
  ) {}

  // -------------------------
  // CRUD base
  // -------------------------
  async create(medication: Medication): Promise<Medication> {
    return this.repository.save(medication);
  }

  async findById(id: string): Promise<Medication | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['medications_docs'],
    });
  }

  async findAll(): Promise<Medication[]> {
    return this.repository.find({
      relations: ['medications_docs'],
      order: { created_at: 'DESC' },
    });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Medication>> {
    const [data, total] = await this.repository.findAndCount({
      relations: ['medications_docs'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, payload: Partial<Medication>): Promise<Medication> {
    await this.repository.update(id, payload);
    return (await this.findById(id)) as Medication;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  // -------------------------
  // Búsquedas por relaciones
  // -------------------------
  async findByPrescriptionId(prescriptionId: string): Promise<Medication[]> {
    return this.repository.find({
      where: { prescription_id: prescriptionId },
      relations: ['medications_docs'],
      order: { created_at: 'DESC' },
    });
  }

  async findByPrescriptionIdPaginated(
    prescriptionId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<Medication>> {
    const [data, total] = await this.repository.findAndCount({
      where: { prescription_id: prescriptionId },
      relations: ['medications_docs'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByIdAndPrescription(
    medicationId: string,
    prescriptionId: string,
  ): Promise<Medication | null> {
    return this.repository.findOne({
      where: { id: medicationId, prescription_id: prescriptionId },
      relations: ['medications_docs'],
    });
  }

  // -------------------------
  // Relaciones con MedicationsDoc
  // -------------------------
  async addDocToMedication(
    medicationId: string,
    medicationDoc: MedicationsDoc,
  ): Promise<MedicationsDoc> {
    medicationDoc.medication_id = medicationId;
    const doc = this.medicationDocRepo.create(medicationDoc);
    return this.medicationDocRepo.save(doc);
  }

  async removeDocFromMedication(
    medicationId: string,
    medicationDocId: string,
  ): Promise<void> {
    await this.medicationDocRepo.delete({
      id: medicationDocId,
      medication_id: medicationId,
    });
  }

  async findDocsByMedication(medicationId: string): Promise<MedicationsDoc[]> {
    return this.medicationDocRepo.find({
      where: { medication_id: medicationId },
    });
  }

  async findDocById(docId: string): Promise<MedicationsDoc | null> {
    return this.medicationDocRepo.findOne({
      where: { id: docId },
    });
  }

  // -------------------------
  // Utilitarios / conteos
  // -------------------------
  async countByPrescriptionId(prescriptionId: string): Promise<number> {
    return this.repository.count({
      where: { prescription_id: prescriptionId },
    });
  }

  async findAllByPrescriptionIds(
    prescriptionIds: string[],
  ): Promise<Medication[]> {
    if (!prescriptionIds.length) return [];

    return this.repository.find({
      where: {
        prescription_id: In(prescriptionIds),
        deleted_at: IsNull(),
      },
      relations: ['medications_docs'],
      order: { created_at: 'DESC' },
    });
  }

  async findLightweightByPrescriptionIds(prescriptionIds: string[]): Promise<
    {
      prescription_id: string;
      id: string;
      nombre: string;
      descripcion: string;
      cantidad: number;
      dosis: string;
      frecuencia_horas: number;
      duracion_dias: number;
      via_administracion: string;
      updated_at: Date;
    }[]
  > {
    if (!prescriptionIds.length) return [];

    return this.repository
      .createQueryBuilder('m')
      .select([
        'm.prescription_id AS prescription_id',
        'm.id AS id',
        'm.nombre AS nombre',
        'm.descripcion AS descripcion',
        'm.dosis AS dosis',
        'm.cantidad AS cantidad',
        'm.frecuencia_horas AS frecuencia_horas',
        'm.duracion_dias AS duracion_dias',
        'm.via_administracion AS via_administracion',
        'm.updated_at AS updated_at',
      ])
      .where('m.prescription_id IN (:...prescriptionIds)', { prescriptionIds })
      .andWhere('m.deleted_at IS NULL')
      .orderBy('m.created_at', 'DESC')
      .getRawMany();
  }

  async findDetailById(medicationId: string): Promise<Medication | null> {
    return (
      this.repository
        .createQueryBuilder('medication')
        // Docs
        .leftJoinAndSelect('medication.medications_docs', 'medications_docs')

        // Prescription
        .leftJoinAndSelect('medication.prescription', 'prescription')

        .where('medication.id = :medicationId', { medicationId })
        .andWhere('medication.deleted_at IS NULL')

        .getOne()
    );
  }

  async findMyLatestPrescriptionMedicationsPaginated(params: {
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginationResult<Medication>> {
    const { userId, page = 1, limit = 10 } = params;

    const today = new Date().toISOString().split('T')[0];

    const baseQb = this.repository.manager
      .createQueryBuilder()
      .select('p.id', 'id')
      .from('prescriptions', 'p')
      .innerJoin('patients', 'patient', 'patient.user_id = p.patient_id')
      .innerJoin('profiles', 'profile', 'profile.user_id = patient.user_id')
      .where('patient.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('patient.deleted_at IS NULL')
      .andWhere('profile.deleted_at IS NULL');

    // 1. Buscar activa
    let latestPrescription = await baseQb
      .clone()
      .andWhere(
        '(p.fecha_inicio_receta <= :today AND p.fecha_fin_receta >= :today)',
        { today },
      )
      .orderBy('p.created_at', 'DESC')
      .limit(1)
      .getRawOne();

    // 2. Si no hay activa -> última cualquiera
    if (!latestPrescription) {
      latestPrescription = await baseQb
        .clone()
        .orderBy('p.created_at', 'DESC')
        .limit(1)
        .getRawOne();
    }

    if (!latestPrescription) {
      return {
        data: [],
        meta: {
          totalItems: 0,
          itemsPerPage: limit,
          currentPage: page,
          totalPages: 0,
        },
      };
    }

    const prescriptionId = latestPrescription.id;

    const [data, total] = await this.repository.findAndCount({
      where: {
        prescription_id: prescriptionId,
        deleted_at: IsNull(),
      },
      relations: ['medications_docs'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
