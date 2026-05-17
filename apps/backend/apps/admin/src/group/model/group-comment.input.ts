import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql'

@InputType()
export class CreateGroupCommentInput {
  @Field(() => Int, { nullable: false })
  groupId: number

  @Field(() => String, { nullable: false })
  content: string

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isSecret: boolean

  @Field(() => Int, { nullable: true })
  parentCommentId?: number
}

@InputType()
export class UpdateGroupCommentInput extends PartialType(
  OmitType(CreateGroupCommentInput, ['groupId', 'parentCommentId'])
) {}
