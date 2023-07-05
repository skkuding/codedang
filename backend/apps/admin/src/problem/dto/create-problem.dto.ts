import { Field, InputType } from '@nestjs/graphql'
import { ProblemUncheckedCreateInput } from '@admin/@generated/problem/problem-unchecked-create.input'

@InputType()
export class TestCaseDto {
  @Field(() => String, { nullable: false })
  input!: string

  @Field(() => String, { nullable: false })
  output!: string
}

@InputType()
export class CreateGroupProblemDto extends ProblemUncheckedCreateInput {
  @Field(() => [TestCaseDto], { nullable: true })
  declare testcase?: Array<TestCaseDto>

  @Field(() => [Number], { nullable: true })
  declare tag?: Array<number>
}

Object.defineProperties(CreateGroupProblemDto.prototype, {
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
