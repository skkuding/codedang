import { Type } from 'class-transformer'
import { IsString, IsDate, IsBoolean } from 'class-validator'

export class UpdateWorkbookDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsDate()
  @Type(() => Date)
  start_time: Date

  @IsDate()
  @Type(() => Date)
  end_time: Date

  @IsBoolean()
  visible: boolean

  @IsBoolean()
  allow_partial_score: boolean
}
