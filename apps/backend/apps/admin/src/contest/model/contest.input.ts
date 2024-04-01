import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql'

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

  @Field(() => Boolean, { nullable: false })
  isVisible!: boolean

  @Field(() => Boolean, { nullable: false })
  isRankVisible!: boolean
}

@InputType()
export class UpdateContestInput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  startTime?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  endTime?: Date

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  isRankVisible?: boolean
}
