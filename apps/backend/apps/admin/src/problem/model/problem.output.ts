import { Field, Int, ObjectType, OmitType } from '@nestjs/graphql'
import { Level, Problem } from '@admin/@generated'

@ObjectType()
export class ProblemWithIsVisible extends OmitType(Problem, [
  'visibleLockTime',
  'description',
  'inputDescription',
  'outputDescription',
  'hint',
  'timeLimit',
  'memoryLimit',
  'difficulty',
  'source'
] as const) {
  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => String, { nullable: false })
  inputDescription!: string

  @Field(() => String, { nullable: false })
  outputDescription!: string

  @Field(() => String, { nullable: false })
  hint!: string

  @Field(() => Int, { nullable: false })
  timeLimit!: number

  @Field(() => Int, { nullable: false })
  memoryLimit!: number

  @Field(() => Level, { nullable: false })
  difficulty!: keyof typeof Level

  @Field(() => String, { nullable: false })
  source!: string

  @Field(() => Boolean, { nullable: true })
  isVisible!: boolean | null
}

@ObjectType()
export class ProblemTestcaseId {
  @Field(() => Number)
  testcaseId!: number
}
