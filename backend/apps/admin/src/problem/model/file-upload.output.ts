import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UploadedProblems {
  @Field(() => Int, { nullable: false })
  count!: number
}
