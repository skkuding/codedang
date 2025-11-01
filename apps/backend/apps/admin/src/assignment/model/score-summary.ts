import { Field, Float, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserAssignmentScoreSummary {
  @Field(() => Int)
  submittedProblemCount: number

  @Field(() => Int)
  totalProblemCount: number

  @Field(() => Float)
  userAssignmentScore: number

  @Field(() => Int)
  assignmentPerfectScore: number

  @Field(() => Float, { nullable: true })
  userAssignmentFinalScore?: number

  @Field(() => [AssignmentProblemSummary])
  scoreSummaryByProblem: AssignmentProblemSummary[]
}

@ObjectType()
export class UserAssignmentScoreSummaryWithUserInfo {
  @Field(() => Int)
  userId: number

  @Field(() => String)
  username: string

  @Field(() => String)
  studentId: string

  @Field(() => String, { nullable: true })
  realName: string

  @Field(() => String)
  major: string

  @Field(() => Int)
  submittedProblemCount: number

  @Field(() => Int)
  totalProblemCount: number

  @Field(() => Float)
  userAssignmentScore: number

  @Field(() => Int)
  assignmentPerfectScore: number

  @Field(() => Float, { nullable: true })
  userAssignmentFinalScore?: number

  @Field(() => [AssignmentProblemSummary])
  scoreSummaryByProblem: AssignmentProblemSummary[]
}

@ObjectType()
class AssignmentProblemSummary {
  @Field(() => Int)
  problemId: number

  @Field(() => Float)
  score: number

  @Field(() => Int)
  maxScore: number

  @Field(() => Float, { nullable: true })
  finalScore?: number

  @Field(() => Int)
  acceptedTestcaseCount: number

  @Field(() => Int)
  totalTestcaseCount: number
}
