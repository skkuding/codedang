import { ObjectType, Field, Int, OmitType } from '@nestjs/graphql'
import type { $Enums } from '@prisma/client'
import { ResultStatus, Submission } from '@admin/@generated'

@ObjectType()
class TestCaseResult {
  @Field(() => String, { nullable: true })
  cpuTime: string | null

  @Field(() => Int)
  id: number

  @Field(() => Int)
  submissionId: number

  @Field(() => Int)
  problemTestcaseId: number

  @Field(() => ResultStatus)
  result: $Enums.ResultStatus

  @Field(() => Int, { nullable: true })
  memoryUsage: number | null

  @Field(() => Date)
  createTime: Date

  @Field(() => Date)
  updateTime: Date
}

@ObjectType()
export class SubmissionDetail extends OmitType(Submission, [
  'user',
  'submissionResult',
  'code',
  'problem',
  'contest',
  'workbook',
  '_count'
] as const) {
  @Field(() => String)
  code: string

  @Field(() => [TestCaseResult])
  testcaseResult: TestCaseResult[]

  @Field(() => String, { nullable: true })
  username: string | null
}
