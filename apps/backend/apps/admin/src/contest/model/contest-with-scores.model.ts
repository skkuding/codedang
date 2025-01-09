import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Contest } from '@admin/@generated'

@ObjectType()
export class ContestWithScores extends Contest {
  @Field(() => Int)
  problemScore: number

  @Field(() => Int)
  totalScore: number
}
