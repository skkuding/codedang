import { Field, InputType, Int } from '@nestjs/graphql'
import { IntScoreScalar } from '@admin/problem/scalar/int-score.scalar'

@InputType()
export class ProblemScoreInput {
  @Field(() => Int)
  problemId: number

  @Field(() => IntScoreScalar)
  score: number
}
