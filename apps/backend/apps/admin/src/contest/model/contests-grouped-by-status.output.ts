import { Field, ObjectType } from '@nestjs/graphql'
import { ContestWithScores } from './contest-with-scores.model'

@ObjectType()
export class ContestsGroupedByStatus {
  @Field(() => [ContestWithScores])
  upcoming: ContestWithScores[]

  @Field(() => [ContestWithScores])
  ongoing: ContestWithScores[]

  @Field(() => [ContestWithScores])
  finished: ContestWithScores[]
}
