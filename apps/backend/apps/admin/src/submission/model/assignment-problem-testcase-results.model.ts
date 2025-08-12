import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ResultStatus } from '@admin/@generated'

@ObjectType()
export class AssignmentProblemTestcaseResult {
  @Field(() => Int, { nullable: false })
  userId!: number

  @Field(() => ResultStatus, { nullable: false })
  result!: `${ResultStatus}`
}
