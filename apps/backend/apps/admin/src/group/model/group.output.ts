import { Field, Int } from '@nestjs/graphql'
import { ObjectType } from '@nestjs/graphql'
import { Group, Role } from '@generated'

@ObjectType()
export class FindGroup extends Group {
  @Field(() => Int, { nullable: false })
  memberNum!: number

  @Field(() => String, { nullable: true })
  invitation: string
}

@ObjectType()
export class DeletedUserGroup {
  @Field(() => Int, { nullable: false })
  count!: number
}

@ObjectType()
export class CanCreateCourseResult {
  @Field(() => Int)
  id: number

  @Field(() => Role)
  role: Role

  @Field()
  canCreateCourse: boolean
}
