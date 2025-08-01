import { Field, Int, ObjectType, OmitType } from '@nestjs/graphql'
import type { $Enums } from '@prisma/client'
import { ResultStatus, Submission } from '@admin/@generated'

@ObjectType()
class ProblemTestcaseResult {
  @Field(() => String)
  input: string

  @Field(() => String)
  output: string
}
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

  @Field(() => ProblemTestcaseResult)
  problemTestcase: ProblemTestcaseResult

  @Field(() => String, { nullable: true })
  output: string | null

  @Field(() => ResultStatus)
  result: $Enums.ResultStatus

  @Field(() => Int, { nullable: true })
  memoryUsage: number | null

  @Field(() => Date)
  createTime: Date

  @Field(() => Date)
  updateTime: Date

  @Field(() => Boolean)
  isHidden: boolean

  @Field(() => Int)
  scoreWeight: number
}

@ObjectType()
export class SubmissionDetail extends OmitType(Submission, [
  'submissionResult',
  'code',
  '_count'
] as const) {
  @Field(() => String)
  code: string

  @Field(() => [TestCaseResult])
  testcaseResult: TestCaseResult[]
}
