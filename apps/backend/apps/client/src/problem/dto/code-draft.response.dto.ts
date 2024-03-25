import type { CreateTemplateDto } from './create-code-draft.dto'

export class CodeDraftResponseDto {
  userId: string
  problemId: string
  template: CreateTemplateDto
  createTime: string
  updateTime: string
}
