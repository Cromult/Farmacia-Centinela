// src/modules/media/infrastructure/s3-client.provider.ts
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigType } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import s3Config from 'src/config/s3.config';

// ⬅️ Exportar ambos símbolos
export const S3_CLIENT = Symbol('S3_CLIENT');
export const S3_CLIENT_FOR_SIGNING = Symbol('S3_CLIENT_FOR_SIGNING');

// Cliente para operaciones (upload, delete)
export const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  inject: [s3Config.KEY],
  useFactory: (cfg: ConfigType<typeof s3Config>) => {
    let credentials: AwsCredentialIdentity | undefined;
    if (cfg.accessKeyId && cfg.secretAccessKey) {
      credentials = {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      };
    }
    return new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      forcePathStyle: cfg.forcePathStyle,
      credentials,
    });
  },
};

// Cliente para firmar URLs
export const s3ClientForSigningProvider: Provider = {
  provide: S3_CLIENT_FOR_SIGNING, // ⬅️ Ahora está definido arriba
  inject: [s3Config.KEY],
  useFactory: (cfg: ConfigType<typeof s3Config>) => {
    let credentials: AwsCredentialIdentity | undefined;
    if (cfg.accessKeyId && cfg.secretAccessKey) {
      credentials = {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      };
    }

    const endpointForSigning = cfg.signEndpoint || cfg.endpoint;

    return new S3Client({
      region: cfg.region,
      endpoint: endpointForSigning,
      forcePathStyle: cfg.forcePathStyle,
      credentials,
    });
  },
};

