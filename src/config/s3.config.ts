// src/config/s3.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET || 'uvirtual',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  presignExpiresSeconds: parseInt(process.env.S3_PRESIGN_EXPIRES_SECONDS || '3600', 10),
  publicEndpoint: process.env.S3_PUBLIC_ENDPOINT,	
  signEndpoint: process.env.S3_PUBLIC_ENDPOINT
    ? process.env.S3_PUBLIC_ENDPOINT.replace('/storage', '') // http://10.8.69.15
    : process.env.S3_ENDPOINT, // fallback a localhost:9000
}));
