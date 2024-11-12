import type { JsonValue } from '@prisma/client/runtime/library'

export class CodeDraftResponseDto {
  userId: number
  problemId: number
  template: JsonValue
  createTime: Date
  updateTime: Date
}
