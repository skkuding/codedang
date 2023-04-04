import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string

  @IsString()
  @IsNotEmpty()
  readonly content: string

  @IsBoolean()
  @IsNotEmpty()
  readonly isVisible: boolean

  @IsBoolean()
  @IsNotEmpty()
  readonly isFixed: boolean
}
