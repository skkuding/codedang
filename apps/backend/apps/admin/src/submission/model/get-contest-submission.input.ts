import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class GetContestSubmissionsInput {
  @Field(() => Int, { nullable: false })
  contestId!: number

  @Field(() => Int, { nullable: true })
  problemId?: number

  @Field(() => String, { nullable: true })
  searchingName?: string
}
