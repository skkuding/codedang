import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class CreateCourseNoticeInput {
  @Field(() => String, { nullable: false })
  title: string

  @Field(() => String, { nullable: false })
  content: string

  @Field(() => Boolean, { nullable: false, defaultValue: true })
  isPublic: boolean

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isFixed: boolean
}

@InputType()
export class UpdateCourseNoticeInput extends PartialType(
  CreateCourseNoticeInput
) {}
