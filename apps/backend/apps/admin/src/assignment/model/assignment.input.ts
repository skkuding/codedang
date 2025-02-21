import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql'
import { IsNumberString, IsOptional, Length } from 'class-validator'

@InputType()
export class CreateAssignmentInput {
  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  description!: string

  @IsOptional()
  @IsNumberString()
  @Length(6, 6)
  @Field(() => String, { nullable: true })
  invitationCode?: string

  @Field(() => GraphQLISODateTime, { nullable: false })
  startTime!: Date

  @Field(() => GraphQLISODateTime, { nullable: false })
  endTime!: Date

  @Field(() => Number, { nullable: false })
  week!: number

  @Field(() => Boolean, { nullable: false })
  isVisible!: boolean

  @Field(() => Boolean, { nullable: false })
  isRankVisible!: boolean

  @Field(() => Boolean, { nullable: false })
  isJudgeResultVisible!: boolean

  @Field(() => Boolean, { nullable: true })
  enableCopyPaste?: boolean
}

@InputType()
export class UpdateAssignmentInput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @IsOptional()
  @IsNumberString()
  @Length(6, 6)
  @Field(() => String, { nullable: true })
  invitationCode?: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  startTime?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  endTime?: Date

  @Field(() => Number, { nullable: false })
  week!: number

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  isRankVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  enableCopyPaste?: boolean

  @Field(() => Boolean, { nullable: true })
  isJudgeResultVisible?: boolean
}
