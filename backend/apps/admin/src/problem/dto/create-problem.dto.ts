import { Field, InputType, OmitType } from '@nestjs/graphql'
import { ProblemTestcaseCreateWithoutProblemInput } from '@admin/@generated/problem-testcase/problem-testcase-create-without-problem.input'
import { ProblemUncheckedCreateWithoutCreatedByInput } from '@admin/@generated/problem/problem-unchecked-create-without-created-by.input'

@InputType()
export class TestCaseDto extends OmitType(
  ProblemTestcaseCreateWithoutProblemInput,
  ['createTime', 'updateTime', 'submissionResult']
) {}

@InputType()
export class CreateGroupProblemInput extends OmitType(
  ProblemUncheckedCreateWithoutCreatedByInput,
  [
    'contestProblem',
    'createTime',
    'problemTag',
    'problemTestcase',
    'workbookProblem',
    'updateTime'
  ] as const
) {
  @Field(() => [TestCaseDto], { nullable: true })
  problemTestcase: Array<TestCaseDto>

  @Field(() => [Number], { nullable: true })
  problemTag: Array<number>
}
