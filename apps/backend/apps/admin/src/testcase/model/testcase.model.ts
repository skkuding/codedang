import { Field, Int, ObjectType } from '@nestjs/graphql'

// avoid name conflict with @admin/@generated
@ObjectType()
export class TestcaseModel {
  @Field(() => Int)
  id: number

  @Field(() => Int)
  problemId: number

  @Field(() => Int, { nullable: true })
  order: number | null // TODO: change to non-nullable

  @Field(() => Int)
  scoreWeight: number

  @Field(() => String)
  input: string

  @Field(() => String)
  output: string

  @Field(() => Boolean, {
    description: 'input/output is so long(over KB) that it is truncated'
  })
  isTruncated: boolean

  @Field(() => Boolean)
  isHidden: boolean
}
