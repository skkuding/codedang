import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateNoticeDto {
  @IsString()
  @IsOptional()
  readonly title: string

  @IsString()
  @IsOptional()
  readonly content: string

  @IsBoolean()
  @IsOptional()
  readonly visible: boolean

  @IsBoolean()
  @IsOptional()
  readonly fixed: boolean
}
