import { Field, ObjectType, OmitType } from '@nestjs/graphql'
import { Problem, ProblemTestcase, ProblemTag } from '@admin/@generated'

@ObjectType()
export class ProblemWithIsVisible extends OmitType(Problem, [
  'exposeTime'
] as const) {
  @Field(() => Boolean, { nullable: false })
  isVisible!: boolean

  @Field(() => [ProblemTestcase], { nullable: true })
  problemTestcase?: Array<ProblemTestcase>

  @Field(() => [ProblemTag], { nullable: true })
  problemTag?: Array<ProblemTag>
}
