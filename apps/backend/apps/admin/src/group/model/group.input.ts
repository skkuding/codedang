import { Field, Int } from '@nestjs/graphql'
import { InputType } from '@nestjs/graphql'
import { GroupUpdateInput } from '@generated'

@InputType()
class Config {
  @Field(() => Boolean, { nullable: false })
  showOnList: boolean

  @Field(() => Boolean, { nullable: false })
  allowJoinFromSearch: boolean

  @Field(() => Boolean, { nullable: false })
  allowJoinWithURL: boolean

  @Field(() => Boolean, { nullable: false })
  requireApprovalBeforeJoin: boolean
}

@InputType()
export class CreateGroupInput {
  @Field(() => String)
  groupName: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { defaultValue: false })
  isPrivate: boolean

  @Field(() => Int, { nullable: true, description: 'Max people (default: 10)' })
  capacity?: number

  @Field(() => String, {
    nullable: true,
    description: 'Private invitation code'
  })
  invitationCode?: string
}

@InputType()
export class CourseInput {
  @Field(() => String, { nullable: false })
  courseTitle: string

  @Field(() => String, { nullable: false })
  courseNum: string

  @Field(() => Int, { nullable: true })
  classNum?: number

  @Field(() => String, { nullable: false })
  professor: string

  @Field(() => String, { nullable: false })
  semester: string

  @Field(() => Int, { nullable: false })
  week: number

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  website?: string

  @Field(() => String, { nullable: true })
  office?: string

  @Field(() => String, { nullable: true })
  phoneNum?: string

  @Field(() => Config, { nullable: false })
  config: Config
}

@InputType()
export class UpdateGroupInput extends GroupUpdateInput {
  @Field(() => String, { nullable: false })
  declare groupName: string

  @Field(() => String, { nullable: false })
  declare description: string

  @Field(() => Config, { nullable: false })
  declare config: Config
}
