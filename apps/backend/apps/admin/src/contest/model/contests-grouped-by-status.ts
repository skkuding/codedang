import { Field, ObjectType } from '@nestjs/graphql'
import { Contest } from '@admin/@generated'

@ObjectType()
export class ContestsGroupedByStatus {
  @Field(() => [Contest])
  upcoming: Contest[]

  @Field(() => [Contest])
  ongoing: Contest[]

  @Field(() => [Contest])
  finished: Contest[]
}
