import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class AnnouncementInput {
  @Field({ nullable: true })
  problemId?: number

  @Field(() => Int)
  contestId: number

  @Field(() => String)
  content: string
}
