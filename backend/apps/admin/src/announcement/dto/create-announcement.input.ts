import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateAnnouncementInput {
  @Field(() => Int, { description: 'problemId field' })
  problemId: number

  @Field(() => String, { description: 'content field' })
  content: string
}
