// src/modules/prescriptions/application/receta-completa.service.ts

import {
  Injectable,
  Inject,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import Groq from 'groq-sdk';

import type { IPrescriptionRepository } from '../domain/prescriptions.repository.interface';
import type { IPatientRepository } from '../../patients/domain/patient.repository.interface';
import { PATIENT_REPOSITORY } from '../../patients/domain/patient.repository.interface';
import type { IMedicationRepository } from 'src/module/medications/domain/medications.repository.interface';

import { Prescription } from '../domain/prescriptions.entity';
import { Medication } from '../../medications/domain/medications.entity';
import { ProcessRawPrescriptionDto } from '../presentation/dtos/process-raw-prescription.dto';

@Injectable()
export class RecetaCompletaService {
  private groq: Groq;

  constructor(
    @Inject('IPrescriptionRepository')
    private readonly prescriptionRepo: IPrescriptionRepository,

    @Inject('IMedicationRepository')
    private readonly medicationRepo: IMedicationRepository,

    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepo: IPatientRepository,
  ) {
    // Inicializamos Groq con la API Key del .env
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GROQ_API_KEY no está configurada en el archivo .env.',
      );
    }
    
    this.groq = new Groq({ apiKey });
  }

  async procesarYCrear(dto: ProcessRawPrescriptionDto): Promise<Prescription> {
    // 1. Validar que el patient_id está presente
    if (!dto.patient_id) {
      throw new UnprocessableEntityException('Patient ID is required.');
    }

    // 2. Validar que el paciente existe
    const patient = await this.patientRepo.findOne(dto.patient_id);
    if (!patient) {
      throw new UnprocessableEntityException(
        `El paciente con ID ${dto.patient_id} no existe.`,
      );
    }

    // 3. Extraer datos estructurados con la IA (Groq)
    const datosEstructurados = await this.extraerDatosConIA(dto.texto_receta);

    // 4. Crear la Prescription principal
    const prescription = new Prescription({
      patient: patient,
      instrucciones_globales: datosEstructurados.instrucciones_globales,
      fecha_inicio_receta: new Date(datosEstructurados.fecha_inicio_receta),
      fecha_fin_receta: new Date(datosEstructurados.fecha_fin_receta),
    });

    const savedPrescription = await this.prescriptionRepo.create(prescription);

    // 5. Crear los medicamentos asociados
    const medicationsToSave = datosEstructurados.medicamentos.map(
      (med: any) => {
        return new Medication({
          prescription_id: savedPrescription.id,
          nombre: med.nombre,
          dosis: med.dosis,
          descripcion: med.descripcion,
          frecuencia_horas: med.frecuencia_horas,
          cantidad: med.cantidad,
          duracion_dias: med.duracion_dias,
          via_administracion: med.via_administracion || 'Oral',
        });
      },
    );

    // Guardar todos los medicamentos
    for (const med of medicationsToSave) {
      await this.medicationRepo.create(med);
    }

    // Devolvemos la receta con sus medicamentos
    savedPrescription.medications = medicationsToSave;
    return savedPrescription;
  }

  /**
   * Método privado que se comunica con Groq y Llama 3
   */
  private async extraerDatosConIA(textoReceta: string): Promise<any> {
    const hoy = new Date().toISOString().split('T')[0]; // Fecha actual YYYY-MM-DD

    const prompt = `
      Eres un asistente médico experto. Tu tarea es leer las siguientes indicaciones médicas informales y extraer los datos exactos en formato JSON.
      
      REGLAS ESTRICTAS:
      1. La "fecha_inicio_receta" es hoy: ${hoy}.
      2. Calcula la "fecha_fin_receta" sumando la "duracion_dias" más larga de los medicamentos a la fecha de hoy. (Si no hay duración específica, asume 7 días y súmalos).
      3. En "instrucciones_globales", pon un resumen de los cuidados generales que no son medicamentos (ej: reposo, dieta, evitar sol).
      4. Calcula "cantidad" multiplicando las dosis diarias por la "duracion_dias". (Ej: 1 cada 8 horas por 5 días = 15).
      5. "frecuencia_horas" debe ser un número entero (ej: cada 8 horas = 8, diario = 24).
      6. Responde ÚNICAMENTE con el objeto JSON, sin texto adicional.

      ESTRUCTURA JSON REQUERIDA:
      {
        "instrucciones_globales": "string",
        "fecha_inicio_receta": "YYYY-MM-DD",
        "fecha_fin_receta": "YYYY-MM-DD",
        "medicamentos": [
          {
            "nombre": "string",
            "dosis": "string",
            "descripcion": "string (instrucciones específicas, ej: después de comer, si hay dolor)",
            "frecuencia_horas": number,
            "cantidad": number,
            "duracion_dias": number,
            "via_administracion": "string (Oral, Tópica, Inhalatoria, etc.)"
          }
        ]
      }

      RECETA A ANALIZAR:
      "${textoReceta}"
    `;

    try {
      // ⚡ Aquí ocurre la magia con Groq a velocidad ultrarrápida
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Eres una API que solo responde en formato JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile', // Modelo súper rápido y gratuito de Meta alojado en Groq
        response_format: { type: 'json_object' }, // Forzamos a que devuelva un JSON estricto
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '{}';
      
      // Parseamos la respuesta de texto a objeto JSON
      const jsonResponse = JSON.parse(responseText);
      return jsonResponse;
      
    } catch (error) {
      console.error('Error al procesar con Groq:', error);
      throw new InternalServerErrorException(
        'No se pudo procesar la receta médica con Inteligencia Artificial.',
      );
    }
  }
}