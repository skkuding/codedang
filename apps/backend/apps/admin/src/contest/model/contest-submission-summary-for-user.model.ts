import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Language, ResultStatus } from '@admin/@generated'
import { UserContestScoreSummary } from './score-summary'

@ObjectType({ description: 'ContestSubmissionSummaryForUser' })
export class ContestSubmissionSummaryForUser {
  @Field(() => UserContestScoreSummary, { nullable: false })
  scoreSummary: UserContestScoreSummary

  @Field(() => [ContestSubmissionSummaryForOne], { nullable: false })
  submissions: ContestSubmissionSummaryForOne[]
}

/**
 * 특정 User의 특정 Contest에 대한 Submission 정보 (!== model SubmissionResult)
 */
@ObjectType({ description: 'ContestSubmissionSummaryForOne' })
export class ContestSubmissionSummaryForOne {
  @Field(() => Int, { nullable: false })
  contestId: number

  @Field(() => String, { nullable: false })
  problemTitle: string

  @Field(() => String, { nullable: false })
  username: string

  @Field(() => String, { nullable: false })
  studentId: string

  @Field(() => ResultStatus, { nullable: false })
  submissionResult: ResultStatus // Accepted, RuntimeError, ...

  @Field(() => Language, { nullable: false })
  language: Language

  @Field(() => String, { nullable: false })
  submissionTime: Date

  @Field(() => Int, { nullable: true })
  codeSize?: number

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => Int, { nullable: false })
  id: number
}
