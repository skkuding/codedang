import { Field } from '@nestjs/graphql'
import { InputType } from '@nestjs/graphql'
import { GroupCreateWithoutCreatedByInput } from '@admin/@generated/group/group-create-without-created-by.input'
import { GroupUpdateInput } from '@admin/@generated/group/group-update.input'

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
export class CreateGroupInput extends GroupCreateWithoutCreatedByInput {
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
