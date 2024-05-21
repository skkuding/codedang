import { Field, ObjectType, OmitType } from '@nestjs/graphql'
import { Problem } from '@admin/@generated'

@ObjectType()
export class ProblemWithIsVisible extends OmitType(Problem, [
  'exposeTime'
] as const) {
  @Field(() => Boolean, { nullable: false })
  isVisible!: boolean
}
