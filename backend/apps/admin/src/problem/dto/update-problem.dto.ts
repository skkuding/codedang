import { Field, InputType, Int } from '@nestjs/graphql'
import { ProblemUncheckedUpdateInput } from '@admin/@generated/problem/problem-unchecked-update.input'
import { TestCaseDto } from './create-problem.dto'

@InputType()
export class UpdateProblemInput extends ProblemUncheckedUpdateInput {
  @Field(() => Int, { nullable: false })
  declare problemId: number // modify

  @Field(() => [TestCaseDto], { nullable: true })
  declare testcase?: Array<TestCaseDto>

  @Field(() => [Number], { nullable: true })
  declare tag?: Array<number>
}

Object.defineProperties(UpdateProblemInput.prototype, {
  createdById: {
    value: undefined,
    writable: false
  },
  createTime: {
    value: undefined,
    writable: false
  },
  updateTime: {
    value: undefined,
    writable: false
  },
  problemTestcase: {
    value: undefined,
    writable: false
  },
  problemTag: {
    value: undefined,
    writable: false
  },
  contestProblem: {
    value: undefined,
    writable: false
  },
  workbookProblem: {
    value: undefined,
    writable: false
  },
  submission: {
    value: undefined,
    writable: false
  }
})
