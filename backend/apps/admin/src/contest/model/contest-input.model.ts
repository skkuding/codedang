import { Field, ID, InputType, Int } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class ContestInput {
  @Field(() => ID, { nullable: false })
  id!: number

  @Field(() => Int, { nullable: false })
  createdById!: number

  @Field(() => Int, { nullable: false })
  groupId!: number

  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => Date, { nullable: false })
  startTime!: Date

  @Field(() => Date, { nullable: false })
  endTime!: Date

  @Field(() => GraphQLJSON, {
    nullable: false,
    description:
      'config default value\n{\n"isVisible": true,\n"isRankVisible": true\n}'
  })
  config!: any

  @Field(() => Date, { nullable: false })
  createTime!: Date

  @Field(() => Date, { nullable: false })
  updateTime!: Date
}
