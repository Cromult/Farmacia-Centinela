// src/modules/media/applications/media-zip.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import { MediaService } from './media.service';
import { Media } from '../domain/media.entity';

@Injectable()
export class MediaZipService {
  constructor(private readonly mediaService: MediaService) {}

  async generateZipByMediaIds(params: {
    mediaIds: string[];
    zipName?: string;
    fileNameResolver?: (media: Media) => string;
  }): Promise<{ buffer: Buffer; fileName: string }> {
    const { mediaIds, zipName, fileNameResolver } = params;

    if (!mediaIds.length) {
      throw new NotFoundException('No se enviaron mediaIds');
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    archive.pipe(stream);

    stream.on('data', (chunk) => chunks.push(chunk));

    archive.on('warning', (err) => {
      console.warn('ZIP warning:', err);
    });

    archive.on('error', (err) => {
      throw err;
    });

    // ✅ procesar archivos (puede ser secuencial o paralelo controlado)
    for (const mediaId of mediaIds) {
      const media = await this.mediaService.getMediaById(mediaId);
      const buffer = await this.mediaService.downloadToBuffer(mediaId);

      const fileName =
        fileNameResolver?.(media) ??
        media.original_name ??
        media.id;

      archive.append(buffer, { name: fileName });
    }

    // ⚠️ finalize NO se await-ea
    archive.finalize();

    // ✅ esperar a que el ARCHIVE termine, no el stream
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return {
      buffer: Buffer.concat(chunks),
      fileName: zipName?.endsWith('.zip')
        ? zipName
        : `${zipName ?? 'media-files'}.zip`,
    };
  }
}
