import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class UpdateCreationPermissionsInput {
  @Field(() => Int)
  userId: number

  @Field(() => Boolean, { nullable: true })
  canCreateCourse: boolean

  @Field(() => Boolean, { nullable: true })
  canCreateContest: boolean
}
