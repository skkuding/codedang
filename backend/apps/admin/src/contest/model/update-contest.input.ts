import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class UpdateContestInput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => GraphQLISODateTime, { nullable: false })
  startTime!: Date

  @Field(() => GraphQLISODateTime, { nullable: false })
  endTime!: Date

  @Field(() => GraphQLJSON, { nullable: false })
  config!: Prisma.JsonValue
}
