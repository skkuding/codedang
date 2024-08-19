import { Field, ObjectType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import { Contest, ContestProblem, ContestRecord } from '@admin/@generated'

@ObjectType()
export class DuplicatedContestResponse {
  @Field(() => Contest)
  contest: Contest

  @Field(() => [ContestProblem])
  problems: ContestProblem[]

  @Field(() => [ContestRecord])
  @Type(() => ContestRecord)
  records: ContestRecord[]
}
