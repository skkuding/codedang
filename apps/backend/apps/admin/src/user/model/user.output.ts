import { Field, Int } from '@nestjs/graphql'
import { ObjectType } from '@nestjs/graphql'
import { Role } from '@generated'

@ObjectType()
export class UpdateCreationPermissionResult {
  @Field(() => Int)
  id: number

  @Field(() => Role)
  role: Role

  @Field()
  canCreateCourse: boolean

  @Field()
  canCreateContest: boolean
}
