// polly.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('polly', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
}));
