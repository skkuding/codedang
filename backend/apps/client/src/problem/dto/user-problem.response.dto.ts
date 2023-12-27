import { Exclude, Expose } from 'class-transformer'
import { CreateTemplateDto } from './create-user-problem.dto'

@Exclude()
export class UserProblemResponseDto {
  @Expose() id: number
  @Expose() userId: string
  @Expose() problemId: string
  @Expose() template: CreateTemplateDto
  @Expose() createTime: string
  @Expose() updateTime: string
}
