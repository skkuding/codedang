import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql'
import { IntScoreScalar } from '@admin/problem/scalar/int-score.scalar'

@InputType()
export class AssignmentProblemInput {
  @Field(() => Int)
  problemId: number

  @Field(() => IntScoreScalar)
  score: number

  @Field(() => GraphQLISODateTime, { nullable: true })
  solutionReleaseTime?: Date | null
}

@InputType()
export class AssignmentProblemUpdateInput {
  @Field(() => Int, { nullable: false })
  problemId: number

  @Field(() => IntScoreScalar, { nullable: true })
  score?: number

  @Field(() => GraphQLISODateTime, { nullable: true })
  solutionReleaseTime?: Date | null
}
