import { Type } from 'class-transformer'
import { IsString, IsDate, IsBoolean, IsNotEmpty } from 'class-validator'

export class UpdateWorkbookDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startTime: Date

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endTime: Date

  @IsBoolean()
  @IsNotEmpty()
  visible: boolean
}
