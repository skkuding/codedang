import { Field, ObjectType } from '@nestjs/graphql'
import { ResultStatus } from '@admin/@generated'

@ObjectType()
export class AssignmentProblemTestcaseResult {
  @Field(() => ResultStatus, { nullable: true })
  result?: ResultStatus // Accepted, WrongAnswer, etc.
}
