import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Group } from '@generated'

@ObjectType()
export class FindGroup extends Group {
  @Field(() => Int, { nullable: false })
  memberNum!: number

  @Field(() => String, { nullable: true })
  invitation: string
}

@ObjectType()
export class DuplicateCourse {
  @Field(() => Group, { nullable: false })
  duplicatedCourse!: Group

  @Field(() => [Int], { nullable: false })
  originAssignments!: number[]

  @Field(() => [Int], { nullable: false })
  copiedAssignments!: number[]
}

@ObjectType()
export class DeletedUserGroup {
  @Field(() => Int, { nullable: false })
  count!: number
}
