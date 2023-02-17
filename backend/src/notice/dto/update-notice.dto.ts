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
  readonly isVisible: boolean

  @IsBoolean()
  @IsOptional()
  readonly isFixed: boolean
}
