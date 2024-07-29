import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Language, SubmissionResult } from '@admin/@generated'

/**
 * 특정 User의 특정 Contest에 대한 Submission 정보 (!== model SubmissionResult)
 */
@ObjectType({ description: 'contestSubmissionInformation' })
export class ContestSubmissionInformation {
  @Field(() => Int, { nullable: false })
  contestId: number

  @Field(() => String, { nullable: false })
  problemTitle: string

  @Field(() => SubmissionResult, { nullable: false })
  submissionResult: SubmissionResult // Accepted, RuntimeError, ...

  @Field(() => Language, { nullable: false })
  language: Language

  @Field(() => String, { nullable: false })
  submissionTime: Date

  @Field(() => Int, { nullable: false })
  codeSize: number

  @Field(() => String, { nullable: false })
  ip: string
}
