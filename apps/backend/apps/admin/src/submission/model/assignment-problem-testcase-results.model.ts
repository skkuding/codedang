import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ResultStatus } from '@admin/@generated'

@ObjectType()
export class AssignmentProblemTestcaseResult {
  @Field(() => Int, { nullable: false })
  userId!: number

  @Field(() => [TestcaseResult], { nullable: false })
  result!: TestcaseResult[]
}

@ObjectType()
class TestcaseResult {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => Boolean, { nullable: false })
  isHidden!: boolean

  @Field(() => ResultStatus, { nullable: false })
  result!: `${ResultStatus}`
}
