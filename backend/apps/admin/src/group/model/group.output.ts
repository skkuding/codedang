import { Field, Int } from '@nestjs/graphql'
import { ObjectType } from '@nestjs/graphql'
import { Group } from '@admin/@generated/group/group.model'

@ObjectType()
export class FindManyGroup extends Group {
  @Field(() => Int, { nullable: false })
  memberNum!: number
}

@ObjectType()
export class FindGroup extends FindManyGroup {
  @Field(() => [String], { nullable: false })
  managers!: Array<string>
}

@ObjectType()
export class DeletedUserGroup {
  @Field(() => Int, { nullable: false })
  count!: number
}
