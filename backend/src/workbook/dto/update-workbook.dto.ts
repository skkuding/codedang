import { Type } from 'class-transformer'
import { IsString, IsDate, IsBoolean } from 'class-validator'

export class UpdateWorkbookDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsDate()
  @Type(() => Date)
  startTime: Date

  @IsDate()
  @Type(() => Date)
  endTime: Date

  @IsBoolean()
  visible: boolean

  @IsBoolean()
  allowPartialScore: boolean
}
