import { Field } from '@nestjs/graphql'
import { InputType } from '@nestjs/graphql'
import { GroupCreateInput, GroupUpdateInput } from '@generated'

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
export class CreateGroupInput extends GroupCreateInput {
  @Field(() => Config, { nullable: false })
  declare config: Config
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
