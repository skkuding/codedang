import { InputType, Int, Field } from '@nestjs/graphql'
import { IsNotEmpty, ValidateIf } from 'class-validator'

@InputType()
export class CreateAnnouncementInput {
  // problemId, contestId 둘 중 하나는 반드시 제공되어야 함
  @Field(() => Int, {
    description: 'related problemId of announcement',
    nullable: true
  })
  @ValidateIf((o) => o.contestId == null) // contestId가 없을 경우 검사
  @IsNotEmpty({ message: 'Either problemId or contestId must be provided' })
  problemId?: number

  @Field(() => Int, {
    description: 'related contestId of announcement',
    nullable: true
  })
  @ValidateIf((o) => o.problemId == null) // problemId가 없을 경우 검사
  @IsNotEmpty({ message: 'Either problemId or contestId must be provided' })
  contestId?: number

  @Field(() => String, {
    description: 'content of announcement',
    nullable: false
  })
  content: string
}
