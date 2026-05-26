// src/modules/media/presentation/media.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../applications/media.service';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const media = await this.mediaService.uploadBuffer({
      fileBuffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      metadata: { fieldname: file.fieldname },
    });
    return {
      id: media.id,
      bucket: media.bucket,
      key: media.object_key,
      mime_type: media.mime_type,
      size_bytes: media.size_bytes,
    };
  }

  @Get(':id/url')
  async getUrl(@Param('id') id: string, @Query() query: GetPresignedUrlDto) {
    const expires = query.exp ?? 3600; // default 1h
    const url = await this.mediaService.getPresignedUrl(id, expires);
    return { url, expires_in: expires };
  }
}
