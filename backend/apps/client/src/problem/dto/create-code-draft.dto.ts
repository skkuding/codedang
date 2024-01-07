import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { Template } from '@client/submission/dto/create-submission.dto'

export class CreateTemplateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Template)
  template: Template[]
}
