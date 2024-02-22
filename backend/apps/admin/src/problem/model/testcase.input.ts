import { Field, InputType, PickType } from '@nestjs/graphql'
import { ProblemTestcaseCreateInput } from '@admin/@generated'

@InputType()
export class Sample {
  @Field(() => String, { nullable: false })
  input!: string

  @Field(() => String, { nullable: false })
  output!: string
}

@InputType()
export class Testcase extends PickType(ProblemTestcaseCreateInput, [
  'input',
  'output',
  'scoreWeight'
]) {}
