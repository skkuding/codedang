import { Field, ObjectType, OmitType } from '@nestjs/graphql'
import { Problem } from '@admin/@generated'
import { TestcaseModel } from '@admin/testcase/model/testcase.model'

@ObjectType()
export class ProblemModel extends OmitType(Problem, [
  'problemTestcase',
  'visibleLockTime'
] as const) {
  @Field(() => Boolean, { nullable: true })
  isVisible!: boolean | null

  @Field(() => [TestcaseModel])
  testcase: TestcaseModel[]
}

@ObjectType()
export class ProblemTestcaseId {
  @Field(() => Number)
  testcaseId!: number
}
