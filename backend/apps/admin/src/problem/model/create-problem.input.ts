import { Field, InputType, OmitType } from '@nestjs/graphql'
import { ProblemTestcaseCreateWithoutProblemInput } from '@admin/@generated/problem-testcase/problem-testcase-create-without-problem.input'
import { ProblemUncheckedCreateWithoutCreatedByInput } from '@admin/@generated/problem/problem-unchecked-create-without-created-by.input'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
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
    'updateTime',
    'groupId',
    'id',
    'submission'
  ] as const
) {
  @Field(() => [TestCaseDto], { nullable: false })
  problemTestcase: Array<TestCaseDto>

  @Field(() => [Number], { nullable: false })
  problemTag: Array<number>
}
