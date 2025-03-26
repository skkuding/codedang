import { Field, Int } from '@nestjs/graphql'
import { ObjectType } from '@nestjs/graphql'
import { Role } from '@generated'

@ObjectType()
export class CanCreateCourseResult {
  @Field(() => Int)
  id: number

  @Field(() => Role)
  role: Role

  @Field()
  canCreateCourse: boolean

  @Field()
  canCreateContest: boolean
}
