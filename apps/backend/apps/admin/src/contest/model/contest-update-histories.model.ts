import { ObjectType, Field, Int } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@ObjectType()
export class UpdateHistoryRecord {
  @Field(() => Int)
  id: number

  @Field(() => Int)
  problemId: number

  @Field()
  updatedAt: Date

  @Field(() => Int)
  updatedById: number

  @Field(() => [String])
  updatedFields: string[]

  @Field(() => [GraphQLJSON])
  updatedInfo: Record<string, string>

  @Field(() => Int, { nullable: true })
  order?: number
}

@ObjectType()
export class ContestUpdateHistories {
  @Field(() => Int)
  contestId: number

  @Field(() => [UpdateHistoryRecord])
  updateHistories: UpdateHistoryRecord[]
}
