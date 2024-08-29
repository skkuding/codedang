import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Language, ResultStatus } from '@admin/@generated'

@ObjectType({ description: 'contestSubmissionOverall' })
export class ContestSubmission {
  @Field(() => String, { nullable: false })
  title!: string // 문제 title

  @Field(() => String, { nullable: false })
  studentId!: string // 학번

  @Field(() => String, { nullable: true })
  realname?: string // 실명

  @Field(() => String, { nullable: false })
  username!: string

  @Field(() => ResultStatus, { nullable: false })
  result!: ResultStatus // Accepted, WrongAnswer ...

  @Field(() => Language, { nullable: false })
  language!: Language

  @Field(() => String, { nullable: false })
  submissionTime!: Date // 제출 시각

  @Field(() => Int, { nullable: true })
  codeSize: number | null

  @Field(() => String, { nullable: true })
  ip: string | null

  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => Int, { nullable: false })
  problemId!: number

  @Field(() => Int, { nullable: false })
  order: number | null
}
