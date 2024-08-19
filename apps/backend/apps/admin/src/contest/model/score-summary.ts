import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserContestScoreSummary {
  @Field(() => Int)
  totalProblemCount: number

  @Field(() => Int)
  submittedProblemCount: number

  @Field(() => Int)
  totalScore: number

  @Field(() => [AcceptedTestcaseSummary])
  acceptedTestcaseCountPerProblem: AcceptedTestcaseSummary[]
}

@ObjectType()
class AcceptedTestcaseSummary {
  @Field(() => Int)
  problemId: number

  @Field(() => Int)
  totalTestcaseCount: number

  @Field(() => Int)
  acceptedTestcaseCount: number
}
