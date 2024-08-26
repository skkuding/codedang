import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class ProblemScoreInput {
  @Field(() => Int)
  problemId: number

  @Field(() => Int)
  score: number
}
