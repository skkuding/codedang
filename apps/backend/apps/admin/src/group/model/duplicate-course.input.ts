import { Field } from '@nestjs/graphql'
import { InputType } from '@nestjs/graphql'

@InputType()
export class DuplicateCourseInput {
  @Field(() => String, { nullable: false })
  courseNum: string

  @Field(() => String, { nullable: false })
  semester: string
}
