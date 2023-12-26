import type { JsonArray } from '@prisma/client/runtime/library'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class UserProblemResponseDto {
  @Expose() id: number
  @Expose() userId: string
  @Expose() problemId: string
  @Expose() template: JsonArray
  @Expose() createTime: string
  @Expose() updateTime: string
}
