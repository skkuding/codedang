import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class AnnouncementInput {
  @Field(() => Int)
  problemId: number

  @Field(() => String)
  content: string
}
