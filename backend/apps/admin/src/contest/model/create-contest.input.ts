import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class CreateContestInput {
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
