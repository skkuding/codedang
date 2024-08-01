import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Language, ResultStatus } from '@admin/@generated'

/**
 * 특정 User의 특정 Contest에 대한 Submission 정보 (!== model SubmissionResult)
 */
@ObjectType({ description: 'contestSubmissionSummary' })
export class ContestSubmissionSummary {
  @Field(() => Int, { nullable: false })
  contestId: number

  @Field(() => String, { nullable: false })
  problemTitle: string

  @Field(() => ResultStatus, { nullable: false })
  submissionResult: ResultStatus // Accepted, RuntimeError, ...

  @Field(() => Language, { nullable: false })
  language: Language

  @Field(() => String, { nullable: false })
  submissionTime: Date

  @Field(() => Int, { nullable: true })
  codeSize?: number

  @Field(() => String, { nullable: false })
  ip: string
}
