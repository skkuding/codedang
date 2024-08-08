import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { CreateSubmissionDto } from '@client/submission/class/create-submission.dto'

export class CreateTemplateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubmissionDto)
  template: CreateSubmissionDto[]
}
