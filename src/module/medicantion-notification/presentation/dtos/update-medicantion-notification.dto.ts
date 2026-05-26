// src/module/medicantion-notification/presentation/dtos/update-medicantion-notification.dto.ts

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMedicantionNotificationDto } from './create-medicantion-notification.dto';

export class UpdateMedicantionNotificationDto extends PartialType(
  OmitType(CreateMedicantionNotificationDto, ['medication_id'] as const),
) {}
