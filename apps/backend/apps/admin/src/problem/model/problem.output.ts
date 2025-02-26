import { Field, ObjectType, OmitType } from '@nestjs/graphql'
import { Problem } from '@admin/@generated'
import { Template } from './template.input'

@ObjectType()
export class ProblemWithIsVisible extends OmitType(Problem, [
  'visibleLockTime',
  'template'
] as const) {
  @Field(() => Boolean, { nullable: true })
  isVisible!: boolean | null

  @Field(() => [Template])
  template!: Array<Template>
}
