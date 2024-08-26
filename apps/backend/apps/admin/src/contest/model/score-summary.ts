import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserContestScoreSummary {
  @Field(() => Int)
  submittedProblemCount: number

  @Field(() => Int)
  totalProblemCount: number

  @Field(() => Int)
  userContestScore: number

  @Field(() => Int)
  contestPerfectScore: number

  @Field(() => [ProblemScore])
  problemScores: ProblemScore[]
}

@ObjectType()
class ProblemScore {
  @Field(() => Int)
  problemId: number

  @Field(() => Int)
  score: number
}
