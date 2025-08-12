import { Type } from 'class-transformer'
import { IsString, IsObject, ValidateNested, IsOptional } from 'class-validator'

class PushSubscriptionKeys {
  @IsString()
  p256dh: string

  @IsString()
  auth: string
}

export class CreatePushSubscriptionDto {
  @IsString()
  endpoint: string

  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeys)
  keys: PushSubscriptionKeys

  @IsString()
  @IsOptional()
  userAgent?: string
}
