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
export class CreateTestcase extends PickType(ProblemTestcaseCreateInput, [
  'input',
  'output',
  'scoreWeight'
]) {}

@InputType()
export class UpdateTestcase extends CreateTestcase {
  @Field()
  id: number
}
