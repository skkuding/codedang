import { Field } from '@nestjs/graphql'
import { ObjectType } from '@nestjs/graphql'
import { Int } from '@nestjs/graphql'

@ObjectType()
export class UpdateUserGroup {
  @Field(() => Int, { nullable: false })
  userId!: number

  @Field(() => Int, { nullable: false })
  groupId!: number

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isGroupLeader!: boolean
}
