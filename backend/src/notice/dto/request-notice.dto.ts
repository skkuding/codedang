import { IsNotEmpty, IsNumberString, IsString } from 'class-validator'

export class RequestNoticeDto {
  @IsNumberString()
  @IsNotEmpty()
  group_id: number

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  visible: boolean

  fixed: boolean
}
