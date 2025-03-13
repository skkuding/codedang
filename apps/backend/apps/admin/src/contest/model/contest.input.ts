import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  ValidateNested
} from 'class-validator'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class CreateContestInput {
  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => Int, { nullable: true })
  penalty?: number

  @Field(() => Boolean, { nullable: true })
  lastPenalty?: boolean

  @Field(() => String, { nullable: true })
  posterUrl?: string

  @IsOptional()
  @IsNumberString()
  @Length(6, 6)
  @Field(() => String, { nullable: true })
  invitationCode?: string

  @Field(() => GraphQLISODateTime, { nullable: false })
  startTime!: Date

  @Field(() => GraphQLISODateTime, { nullable: false })
  endTime!: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  freezeTime?: Date

  @Field(() => Boolean, { nullable: false })
  isVisible!: boolean

  @Field(() => Boolean, { nullable: false })
  isRankVisible!: boolean

  @Field(() => Boolean, { nullable: false })
  isJudgeResultVisible!: boolean

  @Field(() => Boolean, { nullable: true })
  enableCopyPaste?: boolean

  @Field(() => Boolean, { nullable: true })
  evaluateWithSampleTestcase?: boolean

  @IsArray()
  @ValidateNested({ each: true }) // 배열 요소를 개별적으로 검사
  @Type(() => UserContestRoleInput) // class-validator에서 객체 변환 적용
  @Field(() => [UserContestRoleInput], { nullable: true })
  userContestRoles?: UserContestRoleInput[]

  @Field(() => GraphQLJSON, { nullable: true })
  summary?: Record<string, string>
}

@InputType()
export class UpdateContestInput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Int, { nullable: true })
  penalty?: number

  @Field(() => Boolean, { nullable: true })
  lastPenalty?: boolean

  @Field(() => String, { nullable: true })
  posterUrl?: string

  @IsOptional()
  @IsNumberString()
  @Length(6, 6)
  @Field(() => String, { nullable: true })
  invitationCode?: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  startTime?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  endTime?: Date

  @Field(() => Boolean, { nullable: true })
  unfreeze?: boolean

  @Field(() => GraphQLISODateTime, { nullable: true })
  freezeTime?: Date

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  isRankVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  enableCopyPaste?: boolean

  @Field(() => Boolean, { nullable: true })
  isJudgeResultVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  evaluateWithSampleTestcase?: boolean

  @IsArray()
  @ValidateNested({ each: true }) // 배열 요소를 개별적으로 검사
  @Type(() => UserContestRoleInput) // class-validator에서 객체 변환 적용
  @Field(() => [UserContestRoleInput], { nullable: true })
  userContestRoles?: UserContestRoleInput[]

  @Field(() => GraphQLJSON, { nullable: true })
  summary?: Record<string, string>
}

@InputType()
export class UserContestRoleInput {
  @Field(() => Int, { nullable: false })
  @IsNumber()
  userId!: number

  @Field(() => String, { nullable: false })
  @IsString()
  contestRole!: string
}
