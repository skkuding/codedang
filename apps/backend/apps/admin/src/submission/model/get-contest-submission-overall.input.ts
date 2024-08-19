import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class GetContestSubmissionOverallInput {
  @Field(() => Int, { nullable: false })
  contestId!: number

  @Field(() => Int, { nullable: true })
  problemId?: number
}
