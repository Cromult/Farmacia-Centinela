/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/modules/media/applications/media.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ConfigType } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Media } from '../domain/media.entity';
import { generateUniqueId } from '../../../utils/IDUNICOS/unique-id.util';
import {
  S3_CLIENT,
  S3_CLIENT_FOR_SIGNING,
} from '../infrastructure/s3-client.provider';
import s3Config from '../../../config/s3.config';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    @Inject(S3_CLIENT_FOR_SIGNING) private readonly s3ForSigning: S3Client, // ⬅️ NUEVO
    @Inject(s3Config.KEY) private readonly s3Cfg: ConfigType<typeof s3Config>,
  ) {}

  // ✅ ensureBucket, sanitizeMetadata, sanitizeFileName, uploadBuffer NO cambian

  public async ensureBucket(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.s3Cfg.bucket }));
    } catch {
      await this.s3.send(
        new CreateBucketCommand({ Bucket: this.s3Cfg.bucket }),
      );
    }
  }

  private sanitizeMetadata(
    metadata?: Record<string, any>,
  ): Record<string, string> | undefined {
    if (!metadata) return undefined;
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (value === null || value === undefined) continue;
      const stringValue = String(value);
      const cleanValue = stringValue
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/[^\w\s\-\_\.@]/g, '')
        .trim();
      const cleanKey = key
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/[^\w\-\_]/g, '-')
        .toLowerCase();
      if (cleanValue && cleanKey) {
        sanitized[cleanKey] = cleanValue;
      }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s\-\_\.]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .trim();
  }

  async uploadBuffer(params: {
    fileBuffer: Buffer;
    originalName?: string;
    mimeType?: string;
    metadata?: Record<string, any>;
    objectKey?: string;
  }): Promise<Media> {
    await this.ensureBucket();
    const id = generateUniqueId('MEDIA');
    const safeName = this.sanitizeFileName(params.originalName || 'file');
    const objectKey = params.objectKey ?? `${id}/${safeName}`;
    const sanitizedMetadata = this.sanitizeMetadata(params.metadata);

    try {
      const putCommand = new PutObjectCommand({
        Bucket: this.s3Cfg.bucket,
        Key: objectKey,
        Body: params.fileBuffer,
        ContentType: params.mimeType || 'application/octet-stream',
        Metadata: sanitizedMetadata,
      });

      await this.s3.send(putCommand); // ⬅️ Usa this.s3 (localhost:9000)

      const media = this.mediaRepo.create({
        id,
        bucket: this.s3Cfg.bucket,
        object_key: objectKey,
        original_name: params.originalName,
        mime_type: params.mimeType,
        size_bytes: params.fileBuffer.length.toString(),
        metadata: params.metadata,
      });
      return await this.mediaRepo.save(media);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error('❌ Error en uploadBuffer:', {
        error: errorMessage,
        originalName: params.originalName,
        safeName: safeName,
        objectKey: objectKey,
        metadataKeys: params.metadata ? Object.keys(params.metadata) : [],
      });
      throw new InternalServerErrorException('Error subiendo a S3/MinIO');
    }
  }
  async getFileBuffer(mediaId: string): Promise<Buffer> {
  return this.downloadToBuffer(mediaId);
}
  // ⬅️ MODIFICADO: Usar cliente de firma
  async getPresignedUrl(
    mediaId: string,
    expiresSeconds = 3600,
  ): Promise<string> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media no encontrado');

    const getCommand = new GetObjectCommand({
      Bucket: media.bucket,
      Key: media.object_key,
      ResponseContentType: media.mime_type || 'application/octet-stream',
    });

    // ⬅️ Usar cliente de firma (con host 192.168.0.32)
    const presignedUrl = await getSignedUrl(this.s3ForSigning, getCommand, {
      expiresIn: expiresSeconds,
    });

    // Reemplazar endpoint base por /storage
    if (this.s3Cfg.publicEndpoint && this.s3Cfg.signEndpoint) {
      return presignedUrl.replace(
        this.s3Cfg.signEndpoint, // http://192.168.0.32
        this.s3Cfg.publicEndpoint // http://192.168.0.32/storage
      );
    }

    return presignedUrl;
  }

  async remove(mediaId: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) return;

    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: media.bucket,
        Key: media.object_key,
      });
      await this.s3.send(deleteCommand); // ⬅️ Usa this.s3 (localhost:9000)
    } catch (e) {
      console.error('Error deleting object from S3:', e);
    }

    await this.mediaRepo.softRemove(media);
  }

  async getMediaById(mediaId: string): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media no encontrado');
    return media;
  }

  async downloadToBuffer(mediaId: string): Promise<Buffer> {
    const media = await this.getMediaById(mediaId);

    const getCommand = new GetObjectCommand({
      Bucket: media.bucket,
      Key: media.object_key,
    });

    try {
      const response = await this.s3.send(getCommand); // ⬅️ Usa this.s3
      const chunks: Buffer[] = [];

      // @ts-ignore
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error descargando archivo de S3/MinIO',
      );
    }
  }
}
