import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql'
import { IsNumberString, Length } from 'class-validator'

@InputType()
export class CreateContestInput {
  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => String, { nullable: true })
  @IsNumberString()
  @Length(6, 6)
  invitationCode?: string

  @Field(() => GraphQLISODateTime, { nullable: false })
  startTime!: Date

  @Field(() => GraphQLISODateTime, { nullable: false })
  endTime!: Date

  @Field(() => Boolean, { nullable: false })
  isVisible!: boolean

  @Field(() => Boolean, { nullable: false })
  isRankVisible!: boolean

  @Field(() => Boolean, { nullable: true })
  enableCopyPaste?: boolean
}

@InputType()
export class UpdateContestInput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  @IsNumberString()
  @Length(6, 6)
  invitationCode?: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  startTime?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  endTime?: Date

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  isRankVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  enableCopyPaste?: boolean
}
