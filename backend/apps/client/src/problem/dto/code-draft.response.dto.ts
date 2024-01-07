import { Exclude, Expose } from 'class-transformer'
import { CreateTemplateDto } from './create-code-draft.dto'

@Exclude()
export class CodeDraftResponseDto {
  @Expose() userId: string
  @Expose() problemId: string
  @Expose() template: CreateTemplateDto
  @Expose() createTime: string
  @Expose() updateTime: string
}
