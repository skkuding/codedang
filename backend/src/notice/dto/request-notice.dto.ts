import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class RequestNoticeDto {
  @IsNumber()
  @IsNotEmpty()
  group_id: number

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsBoolean()
  @IsNotEmpty()
  visible: boolean

  @IsBoolean()
  @IsNotEmpty()
  fixed: boolean
}
