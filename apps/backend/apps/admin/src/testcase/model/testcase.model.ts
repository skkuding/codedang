import { Field, Int, ObjectType } from '@nestjs/graphql'
import { IntScoreScalar } from '@admin/problem/scalar/int-score.scalar'

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

// Input for updating testcase.
// Only fields to be updated can be given.
// TODO: Is there any better name for this?
@ObjectType()
export class UpdateTestcaseModel {
  @Field(() => Int, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  input?: string

  @Field(() => String, { nullable: true })
  output?: string

  @Field(() => Boolean, { nullable: true })
  isHidden?: boolean

  @Field(() => IntScoreScalar, { nullable: true })
  scoreWeight?: number
}
