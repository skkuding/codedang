import { Field, Int, ObjectType } from '@nestjs/graphql'
import type { Language } from '@admin/@generated'

/**
 * 특정 User의 특정 Contest에 대한 Submission 정보
 */
@ObjectType({ description: 'contestSubmissionResult' })
export class ContestSubmissionResult {
  @Field(() => Int)
  contestId: number

  @Field(() => String)
  problemTitle: string

  @Field(() => String)
  submissionResult: string

  @Field(() => String)
  language: Language

  @Field(() => String)
  submissionTime: Date

  @Field(() => Int)
  codeSize: number

  @Field(() => String)
  ip: string
}
