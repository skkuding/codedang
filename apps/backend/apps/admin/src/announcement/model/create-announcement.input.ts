import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateAnnouncementInput {
  @Field(() => Int, {
    description: 'related contestId of announcement',
    nullable: false
  })
  contestId: number

  @Field(() => Int, {
    description: 'related problemId of announcement',
    nullable: true
  })
  problemId?: number

  @Field(() => String, {
    description: 'content of announcement',
    nullable: false
  })
  content: string
}
