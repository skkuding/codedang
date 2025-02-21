import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Language, ResultStatus } from '@admin/@generated'
import { UserAssignmentScoreSummary } from './score-summary'

@ObjectType({ description: 'AssignmentSubmissionSummaryForUser' })
export class AssignmentSubmissionSummaryForUser {
  @Field(() => UserAssignmentScoreSummary, { nullable: false })
  scoreSummary: UserAssignmentScoreSummary

  @Field(() => [AssignmentSubmissionSummaryForOne], { nullable: false })
  submissions: AssignmentSubmissionSummaryForOne[]
}

/**
 * 특정 User의 특정 Assignment에 대한 Submission 정보 (!== model SubmissionResult)
 */
@ObjectType({ description: 'AssignmentSubmissionSummaryForOne' })
export class AssignmentSubmissionSummaryForOne {
  @Field(() => Int, { nullable: false })
  assignmentId: number

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

  @Field(() => Int, { nullable: false })
  problemId: number

  @Field(() => Int, { nullable: true })
  order: number | null
}
