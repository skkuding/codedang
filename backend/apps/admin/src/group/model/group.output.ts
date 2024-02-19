import { Field, Int } from '@nestjs/graphql'
import { ObjectType } from '@nestjs/graphql'
import { Group } from '@admin/@generated'

@ObjectType()
export class FindGroup extends Group {
  @Field(() => Int, { nullable: false })
  memberNum!: number
}

@ObjectType()
export class DeletedUserGroup {
  @Field(() => Int, { nullable: false })
  count!: number
}
