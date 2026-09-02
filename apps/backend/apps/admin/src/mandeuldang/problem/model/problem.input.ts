import { Field, InputType } from '@nestjs/graphql'
import { ProblemType } from '@generated'

@InputType()
export class CreateMandeuldangProblemInput {
  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => ProblemType, { nullable: false })
  problemType!: ProblemType
}
