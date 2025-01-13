import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Assignment } from '@admin/@generated'

@ObjectType()
export class AssignmentWithScores extends Assignment {
  @Field(() => Int)
  problemScore: number

  @Field(() => Int)
  totalScore: number
}
