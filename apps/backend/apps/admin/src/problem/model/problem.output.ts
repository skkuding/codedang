import { Field, ObjectType, OmitType } from '@nestjs/graphql'
import { Problem } from '@admin/@generated'

@ObjectType()
export class ProblemWithIsVisible extends OmitType(Problem, [
  'visibleLockTime'
] as const) {
  @Field(() => Boolean, { nullable: true })
  isVisible!: boolean | null
}
