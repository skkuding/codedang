import { InputType, PickType } from '@nestjs/graphql'
import { ProblemTestcaseCreateInput } from '@admin/@generated'

@InputType()
export class Testcase extends PickType(ProblemTestcaseCreateInput, [
  'input',
  'output',
  'scoreWeight',
  'isHiddenTestcase'
]) {}
