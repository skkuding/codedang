import { Field, Float, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserContestScoreSummary {
  @Field(() => Int)
  submittedProblemCount: number

  @Field(() => Int)
  totalProblemCount: number

  @Field(() => Float)
  userContestScore: number

  @Field(() => Int)
  contestPerfectScore: number

  @Field(() => [ProblemScore])
  problemScores: ProblemScore[]
}

@ObjectType()
export class UserContestScoreSummaryWithUserInfo {
  @Field(() => String)
  username: string

  @Field(() => String)
  studentId: string

  @Field(() => String, { nullable: true })
  realName: string

  @Field(() => Int)
  submittedProblemCount: number

  @Field(() => Int)
  totalProblemCount: number

  @Field(() => Float)
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

  @Field(() => Float)
  score: number

  @Field(() => Int)
  maxScore: number
}
