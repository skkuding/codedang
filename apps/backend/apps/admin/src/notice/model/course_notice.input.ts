import { Field, InputType, Int, PartialType } from '@nestjs/graphql'

@InputType()
export class CreateCourseNoticeInput {
  @Field(() => Int, { nullable: false })
  groupId: number

  @Field(() => Int, { nullable: true })
  problemId: number

  @Field(() => String, { nullable: false })
  title: string

  @Field(() => String, { nullable: false })
  content: string

  @Field(() => Boolean, { nullable: false, defaultValue: true })
  isVisible: boolean

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isFixed: boolean
}

@InputType()
export class UpdateCourseNoticeInput extends PartialType(
  CreateCourseNoticeInput
) {
  @Field(() => Int, { nullable: false })
  groupId: number
}
