import { Field, InputType, PickType } from '@nestjs/graphql'
import { ProblemTestcase } from '@admin/@generated'

@InputType()
export class Sample {
  @Field(() => String, { nullable: false })
  input!: string

  @Field(() => String, { nullable: false })
  output!: string
}

@InputType()
export class CreateTestcase extends PickType(ProblemTestcase, [
  'input',
  'output',
  'scoreWeight'
]) {}

@InputType()
export class UpdateTestcase extends PickType(ProblemTestcase, [
  'id',
  'input',
  'output',
  'scoreWeight'
]) {}
