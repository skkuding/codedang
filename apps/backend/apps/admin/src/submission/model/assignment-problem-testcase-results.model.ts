import { Field, Int, ObjectType } from '@nestjs/graphql'
import { TestCaseResult } from './submission-detail.output'

@ObjectType()
export class AssignmentProblemTestcaseResult {
  @Field(() => Int, { nullable: true })
  userId!: number | null

  @Field(() => [TestCaseResult])
  testcaseResult: TestCaseResult[]
}
