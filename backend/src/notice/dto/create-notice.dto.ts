import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateNoticeDto {
  @IsNumber()
  @IsNotEmpty()
  readonly group_id: number

  @IsString()
  @IsNotEmpty()
  readonly title: string

  @IsString()
  @IsNotEmpty()
  readonly content: string

  @IsBoolean()
  @IsNotEmpty()
  readonly visible: boolean

  @IsBoolean()
  @IsNotEmpty()
  readonly fixed: boolean
}
